import { ILayout, ICoordinate } from './types';

class ColumnLayout implements ILayout<Date> {

    protected _element: Element;
    protected _dateMin: Date;
    protected _dateMax: Date;

    constructor(element: Element) {
        this._element = element
        this._dateMin = new Date(element.getAttribute('data-datemin')!);
        this._dateMax = new Date(element.getAttribute('data-datemax')!);
    }

    get element() {
        return this._element;
    }

    get children() {
        return [];
    }

    get dateMin() {
        return this._dateMin;
    }

    get dateMax(): Date {
        return this._dateMax;
    }

    getValueAtCoord(coord: ICoordinate): Nullable<Date> {
        const { clientX, clientY } = coord;
        const rect = this._element.getBoundingClientRect();

        let percent = (clientY - rect.y) / rect.height;

        percent = Math.min(percent, 1);
        percent = Math.max(percent, 0);

        const max = this._dateMax.getTime();
        const min = this._dateMin.getTime();

        return new Date(percent * (max - min) + min);
    }

}

class CompositeLayout<V> implements ILayout<V> {

    protected _element: Element;
    protected _children: ILayout<V>[];

    constructor(element: Element, children: ILayout<V>[]) {
        this._element  = element;
        this._children = children;
    }

    get element() {
        return this._element;
    }

    get children(): ILayout<V>[] {
        return this._children;
    }

    getValueAtCoord(coord: ICoordinate): Nullable<V> {
        const { clientX, clientY } = coord;

        const childrenByDistances: Map<number, ILayout<V>> = new Map();

        for (const child of this._children) {

            const { x, y, width, height } = child.element.getBoundingClientRect();
            if (x < clientX && clientX < x + width &&
                y < clientY && clientY < y + height) {
                return child.getValueAtCoord(coord);
            }
            
            const center   = [x + width / 2, y + height / 2];
            const distance = Math.sqrt(
                Math.pow(center[0] - clientX, 2) + Math.pow(center[1] - clientY, 2),
            );
            childrenByDistances.set(distance, child);
        }

        const closest = childrenByDistances.get(Math.min(...childrenByDistances.keys()));
        return closest ? closest.getValueAtCoord(coord) : null;
    }

}

abstract class AbstractLayoutDecorator<V> implements ILayout<V> {

    protected _decorated: ILayout<V>;

    constructor(decorated: ILayout<V>) {
        this._decorated = decorated;
    }

    get decorated() {
        return this._decorated;
    }

    get element() {
        return this._decorated.element;
    }

    get children() {
        return this._decorated.children;
    }

    getValueAtCoord(coord: ICoordinate): Nullable<V> {
        return this._decorated.getValueAtCoord(coord);
    }
}

class MagneticLayoutDecorator extends AbstractLayoutDecorator<Date> {

    protected _step: number;

    constructor(decorated: ILayout<Date>, step: number) {
        super(decorated);
        this._step = step;
    }

    getValueAtCoord(coord: ICoordinate): Nullable<Date> {
        let value =  this._decorated.getValueAtCoord(coord);
        if (value) {
            const timestamp = Math.floor(value.getTime() / this._step) * this._step;
            value = new Date(timestamp);
        }
        
        return value;
    }
    
}

function createLayout(options: any) {
    const { element, step } = options;

    let layout: ILayout = new CompositeLayout<Date>(
        element,
        [...element.querySelectorAll('tbody td[rowspan]')].map((column) => {
            return new ColumnLayout(column)
        })
    );

    if (step) {
        layout = new MagneticLayoutDecorator(layout, step);
    }

    return layout;    
}

export default createLayout
export { ColumnLayout , CompositeLayout, MagneticLayoutDecorator }
export type { ICoordinate }