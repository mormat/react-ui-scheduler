
import DragAndDrop from '../src/test';
import { Column, ColumnCollection } from '../src/trucs/areas';

test.each([
    [{x: 10,   y: 100}, 8],
    [{x: 10,   y: 400}, 20],
    [{x: 10,   y: 250}, 14],
    [{x: 0,    y: 250}, 14],
    [{x: 999,  y: 250}, 14],
    [{x: 10,   y: 0},   8],
    [{x: 10,   y: 999}, 20],
])("Column.getValueAtPos(%s) should return %s)", (point, expectedValue) => {

    const column = new Column(
        {x: 10, y: 100, width: 30, height: 300}, 
        {min: 8, max: 20 }
    );

    expect(column.getValueAtPos(point)).toBe(expectedValue);
})

test.each([
    [{x: 20,   y: 200}, 1],
    [{x: 60,   y: 200}, 2],
    [{x: 0,    y: 200}, 1],
    [{x: 999,  y: 200}, 2],
])("ColumnCollection.getValueAtPos(%s) should return %s", (point, expectedValue) => {

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
        jest.spyOn(item, 'getValueAtPos').mockImplementation((pos) => {
            return pos === point ? index + 1 : null;
        });
    });

    expect(collection.getValueAtPos(point)).toBe(expectedValue);

})
