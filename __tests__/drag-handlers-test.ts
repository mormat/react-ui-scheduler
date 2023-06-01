import { JSDOM } from 'jsdom'

import { MoveEventDragHandler, ResizeEventDragHandler, DispatchableDragHandler  } from '../src/drag-handlers';
import { DragHandlerOptions } from '../src/drag-handlers';
import { ILayout, ICoordinate } from '../src/types';

describe("DragHandler using columnsLayout", () => {

    const { document } = new JSDOM(`
        <body>
            <div id="columnsLayout">
                <div id="column1"
                    data-datemin="1970-01-01 05:00"
                    data-datemax="1970-01-01 10:00"
                ></div>
                <div id="column2"
                    data-datemin="1970-01-01 15:00"
                    data-datemax="1970-01-01 20:00"
                ></div>
            <div>
        </body>
    `).window;

    const columnsLayout: ILayout = {
        element: document.getElementById('columnsLayout')!,
        children: [
            {
                element: document.getElementById('column1')!,
                children: [],
                getValueAtCoord: () => {}
            },
            {
                element: document.getElementById('column2')!,
                children: [],
                getValueAtCoord: () => {}
            },
        ],
        getValueAtCoord: ({clientX, clientY}: ICoordinate) => {
            return new Date(`1970-01-01 ${clientX}:${clientY}`);
        }
    }

    test.each([
        [7,  30, '07:00', '08:00'],
        [5,   0, '05:00', '06:00'],
        [19, 59, '19:00', '20:00'],
    ])("MoveEventDragHandler - dragging to (%s,%s) should update event with {start: %s, end: %s}", 
        (clientX, clientY, startHour, endHour) => {

        const handler = new MoveEventDragHandler(columnsLayout);

        const subject = { 
            start: new Date("1970-01-01 08:00"), 
            end:   new Date("1970-01-01 09:00")
        };

        handler.press({clientX: 8, clientY: 30}, subject);

        handler.move({clientX, clientY}, subject);

        expect(subject).toStrictEqual({
            start: new Date("1970-01-01 " + startHour), 
            end:   new Date("1970-01-01 " + endHour)
        });

    });

    test.each([
        [8, 50, '09:00'],
        [5,  1, '06:05'],
        [11, 0, '10:00'],
        [16, 0, '10:00']
    ])("ResizeEventDragHandler - dragging to (%s, %s) should update event with {start: 06:00 , end: %s}", 
        (clientX, clientY, endHour) => {

        const handler = new ResizeEventDragHandler(columnsLayout, 5 * 60 * 1000);
        
        const subject = { 
            start: new Date("1970-01-01 06:00"), 
            end:   new Date("1970-01-01 08:00")
        };
        
        handler.press({clientX: 7, clientY: 50}, subject);

        handler.move({clientX, clientY}, subject);

        expect(subject).toStrictEqual({
            start: new Date("1970-01-01 06:00"),
            end:   new Date("1970-01-01 " + endHour)
        })

    })

});

describe('DispatchableDragHandler', () => {

    test.each([
        ['foo', 1, 0],
        ['bar', 0, 1],
    ])('DispatchableDragHandler with action="%s" should call "foo" %s times and "bar" %s times', 
        (action, nbrFooCalls, nbrBarCalls) => {

        const dispatchableDragHandler = new DispatchableDragHandler();

        const otherDragHandlers: Dictionary<any> = {
            'foo': buildDragHandlerMock(),
            'bar': buildDragHandlerMock()
        }

        const subject = {};
        const coord   = { clientX: Math.random(), clientY: Math.random() }
        const data    = { action }

        for (let [key, dragHandler] of Object.entries(otherDragHandlers)) {
            const dispatcher = (args: any) => {
                const conditions = new Set([
                    args.subject === subject,
                    args.coord   === coord,
                    args.action  === key,
                ]);

                return !conditions.has(false);
            }

            dispatchableDragHandler.push(dragHandler, dispatcher);
        }
        
        dispatchableDragHandler.press(coord, subject, data);
        expect(otherDragHandlers['foo'].press).toHaveBeenCalledTimes(nbrFooCalls);
        expect(otherDragHandlers['bar'].press).toHaveBeenCalledTimes(nbrBarCalls);
        expect(otherDragHandlers[action].press).toHaveBeenLastCalledWith(coord, subject, data);

        dispatchableDragHandler.move(coord, subject, data);
        expect(otherDragHandlers['foo'].move).toHaveBeenCalledTimes(nbrFooCalls);
        expect(otherDragHandlers['bar'].move).toHaveBeenCalledTimes(nbrBarCalls);
        expect(otherDragHandlers[action].move).toHaveBeenLastCalledWith(coord, subject, data);

        dispatchableDragHandler.release(coord, subject, data);
        expect(otherDragHandlers['foo'].release).toHaveBeenCalledTimes(nbrFooCalls);
        expect(otherDragHandlers['bar'].release).toHaveBeenCalledTimes(nbrBarCalls);
        expect(otherDragHandlers[action].release).toHaveBeenLastCalledWith(coord, subject, data);

    })

});

const buildDragHandlerMock = (props = {}) => {

    return {
        supports: jest.fn(function(subject: any) { return true }),
        press:    jest.fn(function(subject: any, coord: ICoordinate) {}),
        move:     jest.fn(function(subject: any, coord: ICoordinate) {}),
        release:  jest.fn(function(subject: any, coord: ICoordinate) {}),
        ...props
    }

}
