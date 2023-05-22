
import { Rect, Range, Point, Nullable } from './types';



interface Area
{

    getValueAtPos(pos: Point): Nullable<number>

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

    public getValueAtPos(pos: Point): Nullable<number>
    {
        let percent = (pos.y - this._rect.y) / this._rect.height;

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

    public getValueAtPos(pos: Point): Nullable<number>
    {
        let closestDistance = Number.MAX_VALUE;
        let closestItem: Nullable<Column> = null;

        for (const item of this._items) {

            const { x, y, width, height } = item.rect;
            if (x < pos.x && pos.x < x + width &&
                y < pos.y && pos.y < y + height) {
                return item.getValueAtPos(pos);
            }
            
            
            const center   = [x + width / 2, y + height / 2];
            const distance = Math.sqrt(
                Math.pow(center[0] - pos.x, 2) + Math.pow(center[1] - pos.y, 2),
            );
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        }

        return closestItem ? closestItem.getValueAtPos(pos) : null;
    }

}

export { Column as default, Column, ColumnCollection }