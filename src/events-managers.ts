
import { ISchedulerEvent } from './types';

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
export { ArrayEventsRepository, cleanEvent, overlaps }