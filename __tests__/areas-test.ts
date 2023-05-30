
import { Column, ColumnCollection } from '../src/areas';

test.each([
    [10, 100, 8],
    [10, 400, 20],
    [10, 250, 14],
    [0,  250, 14],
    [999,250, 14],
    [10, 0,   8],
    [10, 999, 20],
])("Column.getValueAtPos(%s, %s) should return %s)", (clientX, clientY, expectedValue) => {

    const column = new Column(
        {x: 10, y: 100, width: 30, height: 300}, 
        {min: 8, max: 20 }
    );

    expect(column.getValueAtCoord({clientX, clientY})).toBe(expectedValue);
})

test.each([
    [20,  200, 1],
    [60,  200, 2],
    [0,   200, 1],
    [999, 200, 2],
])("ColumnCollection.getValueAtCoord(%s, %s) should return %s", (clientX, clientY, expectedValue) => {

    const coord = { clientX, clientY }

    const items = [
        new Column(
            {x: 10, y: 100, width: 30, height: 300}, 
            {min: 0, max: 1 }
        ),
        new Column(
            {x: 50, y: 100, width: 30, height: 300}, 
            {min: 1, max: 2 }
        ),
    ]

    const collection = new ColumnCollection(items);

    items.forEach(function(item, index) {
        jest.spyOn(item, 'getValueAtCoord').mockImplementation((pos) => {
            return pos === coord ? index + 1 : null;
        });
    });

    expect(collection.getValueAtCoord(coord)).toBe(expectedValue);

})
