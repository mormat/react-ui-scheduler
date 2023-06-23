
import { ISchedulerEvent, IEventOffset } from '../src/types'

interface Repository<K> {
    
    load(): K[],
    save(item: K): void,

}

// Loading events from an array
class ArrayEventsRepository implements Repository<ISchedulerEvent> {

    protected _pendingEvents: ISchedulerEvent[] = [];
    protected _savedEvents:   ISchedulerEvent[];

    constructor(events: ISchedulerEvent[]) {
        this._savedEvents = events;
    }

    load(): ISchedulerEvent[] {
        this._pendingEvents = [...this._savedEvents].map(i => ({...i}));
        return this._pendingEvents;
    }

    save(event: ISchedulerEvent) {
        const index = this._pendingEvents.indexOf(event);
        if (index >= 0) {
            this._savedEvents[index] = event;
        }
    }

}

function overlaps(event: ISchedulerEvent, otherEvent: ISchedulerEvent): boolean
{
    if (event === otherEvent) return false;

    if ( !(otherEvent.end.getTime() - 1 < event.start.getTime() || event.end.getTime() - 1 < otherEvent.start.getTime()) ) {
        return true;
    }

    return false;
}

function calcEventsOffsets(events: ISchedulerEvent[]): Map<ISchedulerEvent, IEventOffset>
{
    const eventsPositions = new Map();

    const intersections: any = events.map((event, index) => {

        const otherEvents = events.filter(v => overlaps(event, v));
        
        const length = otherEvents.length + 1;

        const allPositions = Array.from({length}, (_, k) => k);
        const otherPositions = otherEvents.map(v => eventsPositions.get(v))
            .filter(v => v !== undefined);
        
        const positions = allPositions.filter(v => !otherPositions.includes(v));
        eventsPositions.set(event, Math.min(...positions));

        return [event, otherEvents];
    })

    const results = new Map();
    for (const [event, otherEvents] of intersections) {

        const current = eventsPositions.get(event)!;
        const otherPositions = otherEvents.map((v: any) => eventsPositions.get(v));
        const length   = Math.max(current, ...otherPositions) + 1;

        results.set(event, {current, length});
    }

    return results;
}

// @todo missing test
function cleanEvent(rawSchedulerEvent: any): ISchedulerEvent {

    const { date, startTime, endTime, ...otherValues } = rawSchedulerEvent;

    return {
        start: new Date(date + " " + startTime),
        end:   new Date(date + " " + endTime),
        ...otherValues
    }
}

function createEventsRepository( { items }: { items: any } ) {

    let repository = new ArrayEventsRepository(items.map(cleanEvent));

    return repository;

}


export default createEventsRepository
export { ArrayEventsRepository, cleanEvent, overlaps, calcEventsOffsets }