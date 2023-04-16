
/**
 * @jest-environment jsdom
 */

import DomUtils from '../src/DomUtils';

test("Extract informations about HTML table element", () => {
    
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
        { x: 20, y: 40, width: 600, height: 400 }
    );
    
    const tbody   = root.querySelector('tbody');
    jest.spyOn(tbody, 'getBoundingClientRect').mockReturnValue(
        { x: 30, y: 80, width: 400, height: 340 }    
    );
    
    const headers = [...root.querySelectorAll('thead th')];
    jest.spyOn(headers[0], 'getBoundingClientRect').mockReturnValue(
        { x: 200, y: 60, width: 120, height: 50 }    
    );
    jest.spyOn(headers[1], 'getBoundingClientRect').mockReturnValue(
        { x: 320, y: 60, width: 130, height: 50 }    
    );
    
    expect(DomUtils.getHtmlTableColumnsInfos(root)).toStrictEqual([
        { x: 200, y: 80, width: 120, height: 340, offsetX: 20, offsetY: 40 },
        { x: 320, y: 80, width: 130, height: 340, offsetX: 20, offsetY: 40 },
    ]);
    
});