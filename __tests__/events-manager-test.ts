
import { ArrayEventsRepository, overlaps } from '../src/events-managers'

const defaultEvent = {
    label: "meeting"
}

describe("ArrayEventsRepository", () => {

    test("loading events", () => {

        const events = [
            {
                ...defaultEvent,
                start: new Date("2020-01-01 10:20"),
                end:   new Date("2020-01-01 10:30"),
            },
            {
                ...defaultEvent,
                start: new Date("2020-01-02 11:20"),
                end:   new Date("2020-01-02 11:30"),
            }
        ]

        const eventsManager = new ArrayEventsRepository(events);

        expect(eventsManager.load()).toStrictEqual(events);

    });

    test("reloading events without saving an updated event", () => {

        const eventsManager = new ArrayEventsRepository([{
            ...defaultEvent,
            start: new Date("2020-01-01 10:20"),
            end:   new Date("2020-01-01 10:30"),
        }]);

        let events = eventsManager.load();

        events[0].end = new Date("2020-01-01 20:00");

        expect(eventsManager.load()).toStrictEqual([{
            ...defaultEvent,
            start: new Date("2020-01-01 10:20"),
            end:   new Date("2020-01-01 10:30"),
        }]);

    });

    test("saving events", () => {

        const eventsManager = new ArrayEventsRepository([{
            ...defaultEvent,
            start: new Date("2020-01-01 10:20"),
            end:   new Date("2020-01-01 10:30"),
        }]);

        const events = eventsManager.load();

        events[0].end = new Date("2020-01-01 20:00");

        eventsManager.save(events[0]);

        expect(eventsManager.load()).toStrictEqual([{
            ...defaultEvent,
            start: new Date("2020-01-01 10:20"),
            end:   new Date("2020-01-01 20:00"),
        }]);

    });

});

describe("Events functions", () => {

    test("is overlapping ?", () => {

        const events = [
            {
                ...defaultEvent,
                start: new Date("2020-01-01 10:20"),
                end:   new Date("2020-01-01 10:30"),
            },
            {
                ...defaultEvent,
                start: new Date("2020-01-02 11:20"),
                end:   new Date("2020-01-02 11:30"),
            },
            {
                ...defaultEvent,
                start: new Date("2020-01-02 10:20"),
                end:   new Date("2020-01-02 12:00"),
            },
        ]

        expect(overlaps(events[0], events[0])).toBe(false);

        expect(overlaps(events[0], events[1])).toBe(false);

        expect(overlaps(events[1], events[2])).toBe(true);

    });

    test("reducers", () => {

        

        const events = [
            {
                ...defaultEvent,
                start: new Date("2020-01-01 10:20"),
                end:   new Date("2020-01-01 10:30"),
            },
            {
                ...defaultEvent,
                start: new Date("2020-01-02 11:20"),
                end:   new Date("2020-01-02 11:30"),
            }
        ]

        events.reduce(
            (result: any, current: any) => {
                /* console.log('current', current);
                console.log('result', result); */
                return 1;
            }, 
            0
        )

    });

});


