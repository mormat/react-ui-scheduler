
interface ICoordinate {
    clientX: number
    clientY: number,
}

interface ISchedulerEvent
{
    label: string;
    start: Date;
    end: Date;
    color?: string,
    backgroundColor?: string // @rename to bgColor ?
}

interface ISchedulerConfig {

    firstHour: number;

    lastHour: number;

    startDate: date|number|string;

    events: any[];

}

interface ILayout<V = any> {

    element: Element

    getValueAtCoord(pos: ICoordinate): Nullable<V>

    children: ILayout<V>[]

}

interface IDragHandler<K>  {

    press(coord: Coordinate, subject: K, data: Dictionary<any>): void

    move(coord: Coordinate, subject: K, data: Dictionary<any>): void

    release(coord: Coordinate, subject: K, options: Dictionary<any>): void
}

interface IEventOffset {
    current: number;
    length:  number;
}

export { ISchedulerEvent, ISchedulerConfig, ILayout, IDragHandler, ICoordinate, IEventOffset }
