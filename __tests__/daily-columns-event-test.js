/**
 * @jest-environment jsdom
 */

import {render, screen, fireEvent, act} from '@testing-library/react'
import '@testing-library/jest-dom';

import DailyColumnsEvent from '../src/DailyColumnsEvent';

describe('DailyColumnsEvent', () => {

    function getDefaultProps() {
        
        const columnsLayout = {
            element: document.createElement('div'),
            children: [
                {
                    element: document.createElement('td'),       
                }
            ]
        }

        jest.spyOn(columnsLayout.element, 'getBoundingClientRect').mockReturnValue(
            new DOMRect(50, 100, 640, 480)
        )
        
        const childElement = columnsLayout.children[0].element;
        childElement.dataset.datemin = "2023-06-01 08:00";
        childElement.dataset.datemax = "2023-06-01 20:00";
        jest.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            new DOMRect(100, 180, 50, 120)
        )

        return { columnsLayout }
        
    }

    test("Displaying label", () => {
                
        const { container } = render(
            <DailyColumnsEvent
                value      = {{
                    label: "Meeting this week",
                    start: new Date("2023-06-01 09:00"),
                    end:   new Date("2023-06-01 12:00"),
                }} 
                { ...getDefaultProps() }
            />        
        );

        const displayedEvent = container.querySelector('.react-ui-scheduler-event');
        expect(displayedEvent.textContent).toContain("Meeting this week");

    });
    
    test("Setting colors", () => {
        
        const { container } = render(
            <DailyColumnsEvent
                value      = {{
                    start: new Date("2023-06-01 09:00"),
                    end:   new Date("2023-06-01 12:00"),
                    color: "white",
                    backgroundColor: "rgb(2, 136, 209)"
                }} 
                { ...getDefaultProps() }
            />        
        );

        const displayedEvent = container.querySelector('.react-ui-scheduler-event');
        expect(displayedEvent).toHaveStyle("color: white");
        expect(displayedEvent).toHaveStyle("background-color: rgb(2, 136, 209)");
        
    })

    test.each([
        ["2023-06-01 08:00", "2023-06-01 12:00", "80",  "40"],
        ["2023-06-01 10:00", "2023-06-01 20:00", "100", "100"],
    ])("Event from '%s' to '%s' should be located at (%s,%s)", (start, end, top, height) => {
           
        const { container } = render(
            <DailyColumnsEvent 
                value = {{
                    label: "Meeting",
                    start: new Date(start),
                    end:   new Date(end)
                }}
                { ...getDefaultProps() }
            />
        );
           
        const displayedEvent = container.querySelector('.react-ui-scheduler-event');
        expect(displayedEvent).toHaveStyle(`top: ${top}px`);
        expect(displayedEvent).toHaveStyle(`height: ${height}px`);
        expect(displayedEvent).toHaveStyle("left: 50px");
        expect(displayedEvent).toHaveStyle("width: 50px");
        
    });
    
    test("Scheduled event is not displayed if not matching the columns layout", () => {
                
        const { container } = render(
            <DailyColumnsEvent 
                value = {{
                    label: "Meeting",
                    start: new Date("1980-06-01 12:00"),
                    end:   new Date("1980-06-01 14:00")
                }}
                { ...getDefaultProps() }
            />
        );

        const displayedEvents = [...container.querySelectorAll('.react-ui-scheduler-event')];

        expect(displayedEvents.length).toBe(0);

    })
    
    test.each([
        ['press',   '.react-ui-scheduler-event'],
        ['move',    '.react-ui-scheduler-event'],
        ['release', '.react-ui-scheduler-event'],
        ['press',   '.react-ui-scheduler-resize-event'],
        ['move',    '.react-ui-scheduler-resize-event'],
        ['release', '.react-ui-scheduler-resize-event'],
    ])("'%s' on '%s' should update scheduled event", (method, selector) => {
                
        const scheduledEvent = {
            label: "Meeting",
            start: new Date("2023-06-01 08:00"),
            end:   new Date("2023-06-01 12:00"),
            registerObserver:   jest.fn(),
            unregisterObserver: jest.fn()
        }
        
        const dragHandler = {
            press:   jest.fn(),
            move:    jest.fn(),
            release: jest.fn()
        }
        
        const { container, unmount } = render(
            <DailyColumnsEvent 
                value = { scheduledEvent }
                dragHandler = { dragHandler }
                { ...getDefaultProps() }
            />
        );

        fireEvent.mouseDown(container.querySelector(selector));
        act(function() { 
            window.dispatchEvent(new CustomEvent('mousemove')) 
            window.dispatchEvent(new CustomEvent('mouseup')) 
        })
        
        expect(dragHandler[method]).toHaveBeenCalled();
        const { listener } = dragHandler[method].mock.calls.at(-1).at(-1);
        
        // update scheduler event and notify observer
        scheduledEvent.start = new Date("2023-06-01 10:00");
        scheduledEvent.end = new Date("2023-06-01 20:00");
        
        act(() => listener());
        
        const displayedEvent = container.querySelector('.react-ui-scheduler-event');
        expect(displayedEvent).toHaveStyle(`top: 100px`);
        expect(displayedEvent).toHaveStyle(`height: 100px`);
        expect(displayedEvent).toHaveStyle("left: 50px");
        expect(displayedEvent).toHaveStyle("width: 50px");
        
    });
    
    test.each([
        ['.react-ui-scheduler-event',        'moving'],
        ['.react-ui-scheduler-resize-event', 'resizing'],
    ])("Dragging an event at '%s' with '%s' behavior", (selector, behavior) => {
        
        const scheduledEvent = {
            label: "Meeting",
            start: new Date("2023-06-01 08:00"),
            end:   new Date("2023-06-01 12:00")
        }
        
        const dragHandler = {
            press:   jest.fn(),
            move:    jest.fn(),
            release: jest.fn()
        }
    
        const { container } = render(
            <DailyColumnsEvent 
                value = { scheduledEvent }
                dragHandler   = { dragHandler }
                { ...getDefaultProps() }
            />
        );

        const displayedEvent = container.querySelector(selector);
        
        // dragging the displayed event
        fireEvent.mouseDown(displayedEvent, {clientX: 10, clientY: 20});
        
        expect(dragHandler.press).toHaveBeenCalledWith(
            expect.objectContaining({clientX: 10, clientY: 20}),
            expect.objectContaining(scheduledEvent), 
            expect.objectContaining({ behavior })
        );

        expect(displayedEvent).toHaveClass('react-ui-scheduler-event-' + behavior);
        
        // moving the dragged event
        let e = new MouseEvent('mousemove', {clientX: 20, clientY: 30});
        act(function() { window.dispatchEvent(e) })
        
        expect(dragHandler.move).toHaveBeenCalledWith(
            e,
            expect.objectContaining(scheduledEvent), 
            expect.objectContaining({ behavior })
        );
        
        expect(displayedEvent).toHaveClass('react-ui-scheduler-event-' + behavior);
    
        // dropping the dragged event
        e = new MouseEvent('mouseup', {clientX: 20, clientY: 30});
        act(function() { window.dispatchEvent(e) });
        
        expect(dragHandler.release).toHaveBeenCalledWith(
            e,
            expect.objectContaining(scheduledEvent), 
            expect.objectContaining({ behavior })
        );
        
        expect(displayedEvent).not.toHaveClass('react-ui-scheduler-event-' + behavior);
    
        // move and release in dragHandler are ignored when item has been dropped
        dragHandler.move.mockClear();
        dragHandler.release.mockClear();
        
        act(function() { window.dispatchEvent(new MouseEvent('mousemove')) })
        expect(dragHandler.move).not.toHaveBeenCalled();
        
        act(function() { window.dispatchEvent(new MouseEvent('mouseup')) })
        expect(dragHandler.release).not.toHaveBeenCalled();
    
    });
    
    test.each([
        ['.react-ui-scheduler-event',        'moving'],
        ['.react-ui-scheduler-resize-event', 'resizing'],
    ])("Ignore drag and drop if right or center mouse button was pressed on '%s'", 
        async (selector) => {
        
        const scheduledEvent = {
            label: "Meeting",
            start: new Date("2023-06-01 08:00"),
            end:   new Date("2023-06-01 12:00")
        }
        
        const dragHandler = {
            press:   jest.fn(),
            move:    jest.fn(),
            release: jest.fn()
        }
    
        const { container } = render(
            <DailyColumnsEvent 
                value = { scheduledEvent }
                dragHandler   = { dragHandler }
                { ...getDefaultProps() }
            />
        );

        const displayedEvent = container.querySelector(selector);
        fireEvent.mouseDown(displayedEvent, { button: 1 });
        fireEvent.mouseDown(displayedEvent, { button: 2 });
        
        expect(dragHandler.press).not.toHaveBeenCalled();

    });

});
