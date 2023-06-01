
/**
 * @jest-environment jsdom
 */

import { ILayout } from '../src/types';
import createLayout from '../src/layouts';
import { ColumnLayout, CompositeLayout, MagneticLayoutDecorator } from '../src/layouts'
import { ICoordinate } from '../src/layouts';

describe("ColumnLayout", () => {

    const root = document.createElement('div');

    beforeEach(() => {
        root.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <td></td>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="tbody">
                    <tr>
                        <td></td>
                        <td id="column1"
                            rowspan="2" 
                            data-datemin="2023-06-05 08:00"
                            data-datemax="2023-06-05 20:00"
                        >
                        </td>
                        <td id="column2"
                            rowspan="2"
                            data-datemin="2023-06-06 08:00"
                            data-datemax="2023-06-06 20:00"
                        ></td>
                    <tr>
                    <tr>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        `;
    });
    

    test("ColumnLayout should return element, dateMin and dateMax and children should be empty", () => {

        const element = root.querySelector('#column1')!;

        const layout = new ColumnLayout(element);

        expect(layout.element).toBe(element);
        expect(layout.dateMin).toStrictEqual(new Date("2023-06-05 08:00"));
        expect(layout.dateMax).toStrictEqual(new Date("2023-06-05 20:00"));
        expect(layout.children).toStrictEqual([]);

    });
    
    test.each([
        [10, 100, "2023-06-05 08:00"],
        [10, 400, "2023-06-05 20:00"],
        [10, 250, "2023-06-05 14:00"],
        [0,  250, "2023-06-05 14:00"],
        [999,250, "2023-06-05 14:00"],
        [10, 0,   "2023-06-05 8:00"],
        [10, 999, "2023-06-05 20:00"],
    ])("ColumnLayout.getValueAtPos({%s, %s}) should return %s", (clientX, clientY, expected) => {

        const element = root.querySelector('#column1')!;

        jest.spyOn(element, 'getBoundingClientRect').mockReturnValue(
            new DOMRect(10, 100, 30, 300)
        );

        const layout = new ColumnLayout(element);

        expect(layout.getValueAtCoord({clientX, clientY})).toStrictEqual(new Date(expected));

    });

    test("CompositeLayout should return element and children", () => {

        const layout = new CompositeLayout(root, [
            { 
                element: root.querySelector('#column1')!,
                children: [],
                getValueAtCoord: pos => null,
            },
            {
                element: root.querySelector('#column2')!,
                children: [],
                getValueAtCoord: pos => null,
            }
        ]);

        expect(layout.element).toBe(root);
        expect(layout.children.length).toBe(2);
        expect(layout.children[0].element).toBe(root.querySelector('#column1'));
        expect(layout.children[1].element).toBe(root.querySelector('#column2'));

    });

    test.each([
        [20,  200, "2023-06-05 08:00"],
        [60,  200, "2023-06-05 20:00"],
        [0,   200, "2023-06-05 08:00"],
        [999, 200, "2023-06-05 20:00"],
    ])("CompositeLayout.getValueAtPos({%s, %s}) should return %s", (clientX, clientY, expected) => {

        const layout = new CompositeLayout(root, [
            { 
                element: root.querySelector('#column1')!,
                children: [],
                getValueAtCoord: pos => new Date("2023-06-05 08:00"),
            },
            {
                element: root.querySelector('#column2')!,
                children: [],
                getValueAtCoord: pos => new Date("2023-06-05 20:00"),
            }
        ]);

        const children = layout.children;

        jest.spyOn(children[0].element, 'getBoundingClientRect').mockReturnValue(
            new DOMRect(10, 100, 30, 300)
        )
        /*
        jest.spyOn(children[0], 'getValueAtCoord').mockReturnValue(
            new Date("2023-06-05 08:00")
        )*/

        jest.spyOn(children[1].element, 'getBoundingClientRect').mockReturnValue(
            new DOMRect(50, 100, 30, 300)
        )
        /*
        jest.spyOn(children[1], 'getValueAtCoord').mockReturnValue(
            new Date("2023-06-05 20:00")
        )
        */

        expect(layout.getValueAtCoord({clientX, clientY})).toStrictEqual(new Date(expected));

    })

    test("createLayout", () => {

        let layout = createLayout({
            type:   'columns',
            element: root
        }) as any;

        expect(layout instanceof CompositeLayout).toBe(true);

        layout = createLayout({
            type:   'columns',
            element: root,
            step: 15 * 60 * 1000

        }) as any;

        expect(layout instanceof MagneticLayoutDecorator).toBe(true);
        expect(layout.decorated instanceof CompositeLayout).toBe(true);
        
    });

});

describe("Layout Decorator", () => {

    test("MagneticLayoutDecorator", () => {

        const decorated = {
            element: document.createElement('div'),
            children: [],
            getValueAtCoord: ({clientX, clientY}: ICoordinate) => {
                switch(clientX +',' + clientY) {
                    case '10,10':
                        return new Date("1970-01-01 08:00");
                    case '10,15':
                        return new Date("1970-01-01 08:05");
                    case '10,25':
                        return new Date("1970-01-01 08:15");
                }
                return null;
            }
        }

        const layout: ILayout = new MagneticLayoutDecorator(
            decorated,
            15 * 60 * 1000
        );

        expect(layout.element).toBe(decorated.element);
        expect(layout.children).toBe(decorated.children);

        expect(layout.getValueAtCoord({clientX: 10, clientY: 10}))
            .toStrictEqual(new Date("1970-01-01 08:00"));

        expect(layout.getValueAtCoord({clientX: 10, clientY: 15}))
            .toStrictEqual(new Date("1970-01-01 08:00"));

        expect(layout.getValueAtCoord({clientX: 10, clientY: 25}))
            .toStrictEqual(new Date("1970-01-01 08:15"));

        expect(layout.getValueAtCoord({clientX: 10, clientY: 35}))
            .toBe(null);

    });

});