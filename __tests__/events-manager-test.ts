
import { ArrayEventsRepository, overlaps, calcEventsOffsets } from '../src/events-managers'

import { ISchedulerEvent, IEventOffset } from '../src/types'

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

    // placement ? 0 out of 1
    test("calcEventsOffsets", () => {

        const events = [
            {
                start: new Date("2020-01-02 11:20"),
                end:   new Date("2020-01-02 11:30"),
                ...defaultEvent,
            },
            {
                start: new Date("2020-01-01 10:00"),
                end:   new Date("2020-01-01 10:25"),
                ...defaultEvent,
            },
            {
                start: new Date("2020-01-01 10:20"),
                end:   new Date("2020-01-01 16:00"),
                ...defaultEvent,
            },
            
            {
                start: new Date("2020-01-01 14:30"),
                end:   new Date("2020-01-01 15:30"),
                ...defaultEvent,
            },
        ]

        const results: Map<ISchedulerEvent, IEventOffset> = calcEventsOffsets(events);

        expect(results.get(events[0])).toStrictEqual({current: 0, length: 1});
        expect(results.get(events[1])).toStrictEqual({current: 0, length: 2});
        expect(results.get(events[2])).toStrictEqual({current: 1, length: 2});
        expect(results.get(events[3])).toStrictEqual({current: 0, length: 2});
        
    });

});


