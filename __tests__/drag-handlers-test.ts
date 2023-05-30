import { MoveEventDragHandler, ResizeEventDragHandler, StrategyDispatcherDragHandler  } from '../src/drag-handlers';
import { DragHandlerOptions } from '../src/drag-handlers';
import { Coordinate } from '../src/areas'


const areaMock = {
    getValueAtCoord: (pos: Coordinate) => pos.clientX * 100 + pos.clientY
}


describe("MoveEventDragHandler", () => {

    test("Supports any subject", () => {

        const handler = new MoveEventDragHandler(areaMock);

        const subject = { min: 2, max: 3}

        expect(handler.supports(subject)).toBe(true);

    })

    test.each([
        [0, 11, 10,  15],
        [1, 0,  100, 105, {'constraints' : [{min: 100, max: 200}]}],
        [1, 99, 195, 200, {'constraints' : [{min: 100, max: 200}]}]
    ])("Event dragged to (%s,%s) should be updated with {start: %s, end: %s} %s", 
        (newClientX, newClientY, expectedStart, expectedEnd, options: DragHandlerOptions = {}) => {

        const handler = new MoveEventDragHandler(areaMock);
        for (const [key, value] of Object.entries(options)) {
            (handler as any)[key] = value;
        }

        const subject = { start: 5, end: 10};

        handler.press(subject, {clientX: 0, clientY: 6});

        handler.move(subject,  {clientX: newClientX, clientY: newClientY});

        expect(subject).toStrictEqual({start: expectedStart, end: expectedEnd});
    })

});

describe("ResizeEventDragHandler", () => {
    
    test("Supports any subject", () => {

        const handler = new ResizeEventDragHandler(areaMock);

        const subject = { min: 2, max: 3 }

        expect(handler.supports(subject)).toBe(true);

    })

    test.each([
        [0, 19, 20],
        [0, 3,  6],
        [0, 3,  10, {'minLength' : 5}],
        [0, 22, 20, {'constraints' : [{min: 0, max: 20}]}],
    ])("Event dragged at (%s, %s) should be ending at %s %s", 
        (newClientX, newClientY, expectedEnd, options: DragHandlerOptions = {}) => {

        const handler = new ResizeEventDragHandler(areaMock);
        for (const [key, value] of Object.entries(options)) {
            (handler as any)[key] = value;
        }

        const subject = { start: 5, end: 10};
        
        handler.press(subject, {clientX: 0, clientY: 9});

        handler.move(subject,  {clientX: newClientX, clientY: newClientY});

        expect(subject).toStrictEqual({start: 5, end: expectedEnd})

    })

});

describe('StrategyDispatcherDragHandler', () => {

    test.each([
        ['foo', 'bar'],
        ['bar', 'foo'],
    ])('Strategy "%s" should be triggered and not "%s"', 
        (expectedTriggeredStrategy, expectedIgnoredStrategy) => {

        const handler = new StrategyDispatcherDragHandler();

        const strategies: { [key: string]: any; } = {}
        for (let name of ['foo', 'bar']) {
            strategies[name] = buildDragHandlerMock();
            handler.setStrategy(name, strategies[name]);
        }

        const subject = { strategy: expectedTriggeredStrategy, start: 0, end: 100 }
        const coord   = { clientX: 0, clientY: 0 }

        handler.supports(subject);
        expect(strategies[expectedTriggeredStrategy].supports).toBeCalledWith(subject);
        expect(strategies[expectedIgnoredStrategy].supports).not.toHaveBeenCalled();

        handler.press(subject, coord);
        expect(strategies[expectedTriggeredStrategy].press).toBeCalledWith(subject, coord);
        expect(strategies[expectedIgnoredStrategy].press).not.toHaveBeenCalled();

        handler.move(subject, coord);
        expect(strategies[expectedTriggeredStrategy].move).toBeCalledWith(subject, coord);
        expect(strategies[expectedIgnoredStrategy].move).not.toHaveBeenCalled();

        handler.release(subject, coord);
        expect(strategies[expectedTriggeredStrategy].release).toBeCalledWith(subject, coord);
        expect(strategies[expectedIgnoredStrategy].release).not.toHaveBeenCalled();
    })

    test("Expecting no errors if strategy is unknown", () => {

        const handler = new StrategyDispatcherDragHandler();

        const subject = { start: 0, end: 100 }
        const coord   = { clientX: 0, clientY: 0 }

        expect(handler.supports(subject)).toBe(false);
        handler.press(subject, coord);
        handler.move(subject, coord);

    })

})


const buildDragHandlerMock = (props = {}) => {

    return {
        supports: jest.fn(function(subject: any) { return true }),
        press:    jest.fn(function(subject: any, coord: Coordinate) {}),
        move:     jest.fn(function(subject: any, coord: Coordinate) {}),
        release:  jest.fn(function(subject: any, coord: Coordinate) {}),
        ...props
    }

}
