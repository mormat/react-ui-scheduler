
/**
 * @jest-environment jsdom
 */

import DomUtils from '../src/utils/dom';

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
    
    expect(DomUtils.getHtmlTableInfos(root)).toStrictEqual({
        offset: {left: 20, top: 40},
        columns: [
            { left: 200, top: 80, width: 120, height: 340},
            { left: 320, top: 80, width: 130, height: 340},
        ]
    });
    
});