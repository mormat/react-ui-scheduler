
/**
 * @jest-environment jsdom
 */

import { getColumnsLayout, startDrag } from '../src/dom-utils';

test("Get columns layout", () => {
    
    const root = document.createElement('div');
    root.innerHTML = `
        <table>
            <thead>
                <tr>
                    <td></td>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    
    jest.spyOn(root, 'getBoundingClientRect').mockReturnValue(
        { left: 20, top: 40, width: 600, height: 400 }
    );
    
    const tbody   = root.querySelector('tbody');
    jest.spyOn(tbody, 'getBoundingClientRect').mockReturnValue(
        { left: 30, top: 80, width: 400, height: 340 }    
    );
    
    const headers = [...root.querySelectorAll('thead th')];
    jest.spyOn(headers[0], 'getBoundingClientRect').mockReturnValue(
        { left: 200, top: 60, width: 120, height: 50 }    
    );
    jest.spyOn(headers[1], 'getBoundingClientRect').mockReturnValue(
        { left: 320, top: 60, width: 130, height: 50 }    
    );
    
    const layout = getColumnsLayout(root);
    
    expect(layout).toStrictEqual({
        left: 20, top: 40, width: 600, height: 400,
        children: [
            { left: 180, top: 40, width: 120, height: 340 },
            { left: 300, top: 40, width: 130, height: 340 }
        ]
    });
});

test("Start drag and drop", () => {
    
    const dragHandler = {
        press:   jest.fn(),
        move:    jest.fn(),
        release: jest.fn(),
    };
    
    const mousedown = new MouseEvent('mousedown');
    const mousemove = new MouseEvent('mousemove');
    const mouseup   = new MouseEvent('mouseup');
    
    let subject = { start: 10, end: 20 };
    
    startDrag(dragHandler, subject, mousedown);
    expect(dragHandler.press).toBeCalledWith(subject, mousedown);
    
    window.dispatchEvent(mousemove);
    expect(dragHandler.move).toBeCalledWith(subject, mousemove);
    
    window.dispatchEvent(mouseup);
    expect(dragHandler.release).toBeCalledWith(subject, mouseup);
    
    // When pressed button has been released, moving and release events are ignored 
    window.dispatchEvent(mousemove);
    expect(dragHandler.move).toHaveBeenCalledTimes(1);
    
    window.dispatchEvent(mouseup);
    expect(dragHandler.release).toHaveBeenCalledTimes(1);
    
    // checks that notify callback was called
    const notify = jest.fn();
    
    startDrag(dragHandler, subject, mousedown, notify );
    expect(notify).toHaveBeenLastCalledWith('press', subject, mousedown);
    
    window.dispatchEvent(mousemove);
    expect(notify).toHaveBeenLastCalledWith('move', subject, mousemove);
    
    window.dispatchEvent(mouseup);
    expect(notify).toHaveBeenLastCalledWith('release', subject, mouseup);
    
    
    
});
