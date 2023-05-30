
interface Range {
    min: number,
    max: number
}

interface Coordinate {
    clientX: number;
    clientY: number;
}

interface Rect {
    x: number,
    y: number,
    width: number,
    height: number
}

interface Area
{
    getValueAtCoord(pos: Coordinate): Nullable<number>
}

class Column implements Area
{

    private _rect: Rect;
    private _range: Range;

    public constructor( rect: Rect, range: Range ) {
        this._rect  = rect;
        this._range = range;
    }

    get rect(): Rect {
        return this._rect;
    }

    get range(): Range {
        return this._range;
    }

    public getValueAtCoord(coord: Coordinate): Nullable<number>
    {
        const { clientX, clientY } = coord;

        let percent = (clientY - this._rect.y) / this._rect.height;

        percent = Math.min(percent, 1);
        percent = Math.max(percent, 0);

        const { max, min } = this._range;

        return percent * (max - min) + min;
    }

}

class ColumnCollection implements Area
{

    private _items: Column[];

    public constructor( items: Column[] )
    {
        this._items = items;
    }

    public getValueAtCoord(coord: Coordinate): Nullable<number>
    {
        const { clientX, clientY } = coord;

        let closestDistance = Number.MAX_VALUE;
        let closestItem: Nullable<Column> = null;

        for (const item of this._items) {

            const { x, y, width, height } = item.rect;
            if (x < clientX && clientX < x + width &&
                y < clientY && clientY < y + height) {
                return item.getValueAtCoord(coord);
            }
            
            const center   = [x + width / 2, y + height / 2];
            const distance = Math.sqrt(
                Math.pow(center[0] - clientX, 2) + Math.pow(center[1] - clientY, 2),
            );
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        }

        return closestItem ? closestItem.getValueAtCoord(coord) : null;
    }

}

// @todo missing test
class MagneticGridDecorator implements Area
{
    
    protected _area: Area;
    protected _step: number;

    constructor(area: Area, step: number)
    {
        this._area = area;
        this._step = step;
    }

    public getValueAtCoord(coord: Coordinate): Nullable<number>
    {
        let value = this._area.getValueAtCoord(coord);
        if (value) {
            value = Math.floor(value / this._step) * this._step;
        }
        return value;
    }

}

export type { Area, Coordinate, Range }
export { Column, ColumnCollection, MagneticGridDecorator }