/**
 * @jest-environment jsdom
 */

import {render, screen, fireEvent, act} from '@testing-library/react'

import SchedulerEvent from '../src/components/SchedulerEvent';

import DragAndDrop  from '../src/utils/drag-n-drop';

import { Fragment, createRef } from 'react';

import '@testing-library/jest-dom'

describe('[SchedulerEvent]',  function() {
    
    test('Initialisation with empty values should be OK', async () => {
        render(
            <SchedulerEvent />
        )
    });
    
    test("Events should be displayed at the right place", () => {
        
        const columns = [
            {
                data: { min: 100, max: 200 },
                rect: { left: 10, top: 100, height: 100, width: 70}
            }
        ];
        
        const event = { start: 125, end: 175 }
        
        const { container } = render(
            <SchedulerEvent value = { event } columns = { columns } />
        );

        const root = container.children[0];
        
        expect(root).toHaveStyle("left:    10px");
        expect(root).toHaveStyle("width:   70px");
        expect(root).toHaveStyle("top:    125px");
        expect(root).toHaveStyle("height:  50px");
        
    });
    
    
    test("Displaying event's description", async () => {
        
        const value = {
            start : new Date("2010-02-05 09:00").getTime(),
            end   : new Date("2010-02-05 12:00").getTime(),
            label : "some meeting"
        }
        
        const { container } = render(
            <SchedulerEvent value = { value } />
        );

        const root = container.children[0];    
        
        expect(root.children[0].innerHTML).toBe('09:00 - 12:00');
        expect(root.children[1].innerHTML).toBe('some meeting');
    });
    
    test("Displaying event's colors", async () => {
        
        const value = {
            color : "white",
            backgroundColor : "rgb(2, 136, 209)"
        }
        
        const { container } = render(
            <SchedulerEvent value = { value } />
        );

        const root = container.children[0];    
        
        expect(root).toHaveStyle("color: white");
        expect(root).toHaveStyle("background-color: rgb(2, 136, 209)");
    });
    
    test("Dragging an event should update the starting and ending values of this event", () => {

        let providedValues = {}

        jest.spyOn(DragAndDrop, 'dragMoveHandle').mockImplementationOnce(
            function ({ clientX, clientY }, {start, end, setStart, setEnd, columns, step}) {
                providedValues = { columns, clientX, clientY, step }
                setStart(start - 25);
                setEnd(end - 25);
            }
        );

        const event = { start: 125, end: 175 }
        
        const columns = [
            {
                data: { min: 100, max: 200 },
                rect: { left: 10, top: 100, height: 100, width: 70}
            }
        ];
        
        const { container } = render(
            <SchedulerEvent value = { event } columns = { columns }/>
        );

        const root = container.children[0];
        
        fireEvent.mouseDown(root, {clientX: 10, clientY: 100} );
        expect(providedValues).toStrictEqual({
            columns, clientX: 10, clientY: 100, step: 15 * minuteInterval
        })
        expect(root).toHaveStyle("top:    100px");
        expect(root).toHaveStyle("height: 50px");
    });
    
    test("Dragging the event resize handle should update the ending value of this event", () => {

        let providedValues = {}

        jest.spyOn(DragAndDrop, 'dragResizeHandle').mockImplementationOnce(
            function ({ clientX, clientY }, {start, end, setEnd, columns, step}) {
                providedValues = { columns, clientX, clientY, step }
                setEnd(end - 25);
            }
        );

        const event = { start: 125, end: 175 }
        
        const columns = [
            {
                data: { min: 100, max: 200 },
                rect: { left: 10, top: 100, height: 100, width: 70}
            }
        ];
        
        const { container } = render(
            <SchedulerEvent value = { event } columns = { columns }/>
        );

        const handle = screen.getByLabelText('resize event');
        fireEvent.mouseDown(handle, {clientX: 10, clientY: 100} );
        
        expect(providedValues).toStrictEqual({
            columns, clientX: 10, clientY: 100, step: 15 * minuteInterval
        })
        
        const root   = container.children[0];
        expect(root).toHaveStyle("top:    125px");
        expect(root).toHaveStyle("height:  25px");
        
    });
        
});

const minuteInterval = 60 * 1000;