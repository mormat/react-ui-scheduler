
import { ILayout, IDragHandler, ICoordinate} from './types';

interface DragHandlerOptions {
    minLength?: number;
    constraints?: Range[];
}

class MoveEventDragHandler implements IDragHandler<any> {
    
    private _columnsLayout: ILayout;
    private _data: Map<any,Dictionary>;

    constructor(columnsLayout: ILayout) {
        this._columnsLayout = columnsLayout;
        this._data = new Map<any,Dictionary>();
    }

    public press(coord: ICoordinate, subject: any) {
    
        const value = this._columnsLayout.getValueAtCoord(coord);

        this._data.set(subject, {
            diff:   value ? value - subject.start: 0,
            length: subject.end - subject.start
        });
        
    }

    public move(coord: ICoordinate, subject: any) {

        const value = this._columnsLayout.getValueAtCoord(coord);

        const data  = this._data.get(subject);

        if (data && value) {
            let start = value - data.diff;

            for (let { element } of this._columnsLayout.children) {

                const datemin = new Date(element.getAttribute('data-datemin')!);
                const datemax = new Date(element.getAttribute('data-datemax')!);

                if (datemin <= value && value <= datemax) {
                    start = Math.max(start, datemin.getTime());
                    start = Math.min(start, datemax.getTime() - data.length);
                }

            }

            subject.start = new Date(start);
            subject.end   = new Date(start + data.length);
        }
    }

    public release(coord: ICoordinate, subject: any) {}

}

class ResizeEventDragHandler implements IDragHandler<any> {

    private _columnsLayout: ILayout;
    private _minLength: number = 1;   
    private _data: Map<any,Dictionary>;

    constructor(columnsLayout: ILayout, minLength: number = 1) {
        this._columnsLayout = columnsLayout;
        this._minLength = minLength;
        this._data = new Map<any,Dictionary>();
    }

    public press(coord: ICoordinate, subject: any) {

        const value = this._columnsLayout.getValueAtCoord(coord);

        this._data.set(subject, {
            diff: value ? value - subject.end: 0,
        });

    }

    public move(coord: ICoordinate, subject: any) {

        const value = this._columnsLayout.getValueAtCoord(coord);
        
        const data  = this._data.get(subject);

        if (value && data) {

            let end = value - data.diff;

            end = Math.max(end, subject.start.getTime() + this._minLength);

            for (let { element } of this._columnsLayout.children) {

                const datemin = new Date(element.getAttribute('data-datemin')!);
                const datemax = new Date(element.getAttribute('data-datemax')!);

                if (datemin <= subject.start && subject.start <= datemax) {
                    end = Math.min(end, datemax.getTime());
                }

            }

            subject.end = new Date(end);

        }

    }

    public release(coord: ICoordinate, subject: any) {}
}

class DispatchableDragHandler implements IDragHandler<any> {

    protected _items: any[] = [];

    // @todo how to type a function ?
    public push(dragHandler: IDragHandler<any>, dispatcher: any)
    {
        this._items.push({dragHandler, dispatcher})
    }

    protected _triggerDragHandler(method: string, coord: ICoordinate, subject: any, data: any) {
        for (let {dragHandler, dispatcher} of this._items) {    
            if (dispatcher({ subject, coord, ...data})) {
                dragHandler[method](coord, subject, data);
            }
        }
    }

    public press(coord: ICoordinate, subject: any, data: any) {
        this._triggerDragHandler('press', coord, subject, data);
    }

    public move(coord: ICoordinate, subject: any, data: any) {
        this._triggerDragHandler('move', coord, subject, data);
    }

    public release(coord: ICoordinate, subject: any, data: any) {
        this._triggerDragHandler('release', coord, subject, data);
    }

}

// @todo missing test
class ListenableDragHandler implements IDragHandler<any> {

    protected _dragHandler: IDragHandler<any>;

    constructor(dragHandler: IDragHandler<any>) {
        this._dragHandler = dragHandler;
    }

    public press(coord: ICoordinate, subject: any, data: any) {
        this._dragHandler.press(coord, subject, data);
        if ('listener' in data) {
            data['listener']('press', this)
        }
    }

    public move(coord: ICoordinate, subject: any, data: any) {
        this._dragHandler.move(coord, subject, data);
        if ('listener' in data) {
            data['listener']('move', this)
        }
    }

    public release(coord: ICoordinate, subject: any, data: any) {
        this._dragHandler.release(coord, subject, data);
        if ('listener' in data) {
            data['listener']('release', this)
        }
    }

}

// @todo missing test ?
function createDragHandler(options: Dictionary<any> = {}): IDragHandler<any>
{
    const { columnsLayout, minLength = 1} = options;

    const moveEventDragHandler = new MoveEventDragHandler(columnsLayout);

    const resizeEventDragHandler = new ResizeEventDragHandler(columnsLayout, minLength);
    
    let dragHandler = new DispatchableDragHandler();
    dragHandler.push(moveEventDragHandler,   ({ behavior }: any) => behavior === 'moving');
    dragHandler.push(resizeEventDragHandler, ({ behavior }: any) => behavior === 'resizing');
    
    return new ListenableDragHandler(dragHandler);
}


export { createDragHandler }
export { MoveEventDragHandler, ResizeEventDragHandler, DispatchableDragHandler }
export type {IDragHandler, DragHandlerOptions}