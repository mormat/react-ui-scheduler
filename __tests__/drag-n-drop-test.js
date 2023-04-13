/**
 * @jest-environment jsdom
 */

// @todo, flatten rect and data in column
// @todo how to trigger event once ?
import { act } from '@testing-library/react';

import DragAndDrop from '../src/utils/drag-n-drop';

const second = 60 * 1000;

describe('Drag and drop event handle in a 640x480 window',  () => {
    
    
    test.each([
        [320,  120,  275],
        [320,  121,  275],
        [320,  0,    255],
        [320,  480,  300],
        [0,   0,     255],
        [0,   480,   300],
        [640,   0,   255],
        [640, 480,   300],
    ])("Moving mouse to (%s,%s) should update event's end time to %s", async (posx, posy, expectedEventEnd) => {
        
        const columns = [
            { rect: {left: 20,  top: 20, width: 200, height: 400}, data: {min: 100, max: 200} },
            { rect: {left: 220, top: 20, width: 200, height: 400}, data: {min: 200, max: 300} },
            { rect: {left: 420, top: 20, width: 200, height: 400}, data: {min: 300, max: 400} },
        ];
  
        const setEnd   = jest.fn();
        
        DragAndDrop.dragResizeHandle(
            new MouseEvent('mousedown', {clientX: 221, clientY: 100}), 
            { start: 250, end: 270, setEnd, columns, step: 5 }
        );
    
        await mousemove( posx, posy );
        
        expect(setEnd).toHaveBeenCalledWith(expectedEventEnd);
    })
    
})

describe('Drag and drop event panel in a 640x480 window', () => {
    
    test.each([
        [120,  20,  100, 150],
        [320,  20,  200, 250],
        [520,  20,  300, 350],
        [320, 240,  250, 300],
        [0,   0,    100, 150],
        [0,   480,  150, 200],
        [640,   0,  300, 350],
        [640, 480,  350, 400],
        [320,   0,  200, 250],
        [320, 480,  250, 300],
        [120,  34,  100, 150],
    ])("Moving mouse to (%s,%s) should update event range from %s to %s", async (posx, posy, expectedEventStart, expectedEventEnd) => {

        const columns = [
            { rect: {left: 20,  top: 20, width: 200, height: 400}, data: {min: 100, max: 200} },
            { rect: {left: 220, top: 20, width: 200, height: 400}, data: {min: 200, max: 300} },
            { rect: {left: 420, top: 20, width: 200, height: 400}, data: {min: 300, max: 400} },
        ];

        const setStart = jest.fn();
        const setEnd   = jest.fn();

        DragAndDrop.dragMoveHandle(
            new MouseEvent('mousedown', {clientX: 221, clientY: 100}), 
            { start: 220, end: 270, setStart, setEnd, columns, step: 5 }
        );

        await mousemove( posx, posy );

        expect(setStart).toHaveBeenCalledWith(expectedEventStart);
        expect(setEnd).toHaveBeenCalledWith(expectedEventEnd);
        
    });
    
    test('Moving the mouse when button is not pressed should not trigger any changes', async () => {
        
        const columns = [
            { rect: {left: 20,  top: 20, width: 200, height: 400}, data: {min: 100, max: 200} },
            { rect: {left: 220, top: 20, width: 200, height: 400}, data: {min: 200, max: 300} },
            { rect: {left: 420, top: 20, width: 200, height: 400}, data: {min: 300, max: 400} },
        ];

        const setStart = jest.fn();
        const setEnd   = jest.fn();
        
        DragAndDrop.dragMoveHandle(
            new MouseEvent('mousedown'), 
            { start: 220, end: 270, setStart, setEnd, columns }
        );

        await mouseup( 320, 240 );
        await mousemove( 325, 245 );
        
        expect(setStart).toHaveBeenCalledTimes(0);
        expect(setEnd).toHaveBeenCalledTimes(0);
    })
    
})


const mousemove = (clientX, clientY) => act(() => {
    
    window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
    
});

const mouseup = (clientX, clientY) => act(() => {
    
    window.dispatchEvent(new MouseEvent('mouseup', { clientX, clientY }));
    
});
