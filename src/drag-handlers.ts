
import { Area, Coordinate, Range } from './areas'

interface DragHandler<K>  {
    supports(subject: K): boolean

    press(subject: K, coord: Coordinate): void

    move(subject: K, coord: Coordinate): void

    release(subject: K, coord: Coordinate): void
}

interface DragHandlerOptions {
    minLength?: number;
    constraints?: Range[];
}

class MoveEventDragHandler implements DragHandler<any> {
    
    private _area: Area;
    private _constraints: Range[] = [];
    private _data: Map<any,Dictionary>;

    constructor(area: Area) {
        this._area = area;
        this._data = new Map<any,Dictionary>();
    }

    set constraints(val: Range[]) {
        this._constraints = val;
    }

    public supports(subject: any) {
        return true;
    }

    public press(subject: any, coord: Coordinate) {
    
        const value = this._area.getValueAtCoord(coord);

        this._data.set(subject, {
            diff:   value ? value - subject.start: 0,
            length: subject.end - subject.start
        });
        
    }

    public move(subject: any, coord: Coordinate) {

        const value = this._area.getValueAtCoord(coord);
        
        const data  = this._data.get(subject);

        if (data && value) {

            let start = value - data.diff;

            for (let constraint of this._constraints) {
                if (constraint.min <= value && value <= constraint.max) {
                    start = Math.max(start, constraint.min);
                    start = Math.min(start, constraint.max - data.length);
                }
            }

            subject.start = start;
            subject.end   = subject.start + data.length;
        }
    }

    public release(subject: any, coord: Coordinate) {}

}

class ResizeEventDragHandler implements DragHandler<any> {

    private _area: Area;
    private _constraints: Range[] = [];
    private _minLength: number = 1;   
    private _data: Map<any,Dictionary>;

    constructor(area: Area) {
        this._area = area;
        this._data = new Map<any,Dictionary>();
    }

    set minLength(val: number) {
        this._minLength = val;
    }

    set constraints(val: Range[]) {
        this._constraints = val;
    }

    public supports(subject: any) {
        return true;
    }

    public press(subject: any, coord: Coordinate) {

        const value = this._area.getValueAtCoord(coord);

        this._data.set(subject, {
            diff: value ? value - subject.end: 0,
        });

    }

    public move(subject: any, coord: Coordinate) {

        const value = this._area.getValueAtCoord(coord);
        
        const data  = this._data.get(subject);

        if (value && data) {

            let end = value - data.diff;

            end = Math.max(end, subject.start + this._minLength);

            for (let constraint of this._constraints) {
                if (constraint.min <= subject.start && subject.start <= constraint.max) {
                    end = Math.min(end, constraint.max);
                }
            }

            subject.end = end;

        }

    }

    public release(subject: any, coord: Coordinate) {}
}

class StrategyDispatcherDragHandler implements DragHandler<any> {

    protected _strategies: Dictionary<any> = {}

    setStrategy(name: string, instance: DragHandler<any>) {
        this._strategies[name] = instance;
    }

    public supports(subject: any) {
        if (subject.strategy in this._strategies) {
            return this._strategies[subject.strategy].supports(subject);
        }
        return false;
    }

    public press(subject: any, coord: Coordinate) {
        if (subject.strategy in this._strategies) {
            this._strategies[subject.strategy].press(subject, coord);
        }
    }

    public move(subject: any, coord: Coordinate) {
        if (subject.strategy in this._strategies) {
            this._strategies[subject.strategy].move(subject, coord);
        }
    }

    public release(subject: any, coord: Coordinate) {
        if (subject.strategy in this._strategies) {
            this._strategies[subject.strategy].release(subject, coord);
        }
    }
}

// @todo missing test ?
function createDragHandler(options: Dictionary<any> = {}): DragHandler<any>
{
    const { area, constraints, minLength } = options;

    const moveEventDragHandler = new MoveEventDragHandler(area);
    moveEventDragHandler.constraints = constraints;

    const resizeEventDragHandler = new ResizeEventDragHandler(area);
    resizeEventDragHandler.constraints = constraints;
    resizeEventDragHandler.minLength = minLength;
    
    let dragHandler = new StrategyDispatcherDragHandler();
    dragHandler.setStrategy('move',   moveEventDragHandler);
    dragHandler.setStrategy('resize', resizeEventDragHandler);

    return dragHandler;
}

export { createDragHandler }
export { MoveEventDragHandler, ResizeEventDragHandler, StrategyDispatcherDragHandler }
export type {DragHandler, DragHandlerOptions}