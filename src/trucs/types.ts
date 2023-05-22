interface Range {
    min: number,
    max: number
}

interface Point {
    x: number,
    y: number
}

interface Size {
    width: number,
    height: number
}

interface Rect extends Point, Size {}

type Nullable<T> = T | null;

export { Range, Point, Size, Rect, Nullable }