/**
 * @jest-environment jsdom
 */

import {render, screen, fireEvent, act} from '@testing-library/react'

require('jest-mock-now')(new Date('2023-04-17'));

import React from 'react';

import Scheduler from '../src/components/Scheduler';

jest.mock('../src/components/SchedulerEvent', () => ( 

    { value, columns = [] }) => {

        return (
            <div className        = "mocked_event"
                 data-columns     = { JSON.stringify(columns) } 
                 data-event-start = { value.start }
                 data-event-end   = { value.end }
                 data-event-label = { value.label }
            ></div>
        )
    }

);

describe('[Scheduler] initialization',  function() {

    test("If date missing in params, the headers should be displaying the days of the current week", async() => {
        
        const { container, debug } = render(
            <Scheduler />
        );

        const headers = container.querySelectorAll('table thead th');
        
        const columns = container.querySelectorAll('.mocked_column');
        
        expect([...headers].map(t => t.innerHTML)).toStrictEqual([
            'Mon, April 17, 2023',
            'Tue, April 18, 2023',
            'Wed, April 19, 2023',
            'Thu, April 20, 2023',
            'Fri, April 21, 2023',
            'Sat, April 22, 2023',
            'Sun, April 23, 2023',
        ]);
        
    });

    test.each([
        ['2023-04-05'],
        ['2023-04-09']
    ])('If date is "%s", the headers should be displaying the days of the corresponding week', async (currentDate) => {
        
        const { container } = render(
            <Scheduler currentDate = { currentDate } />
        );

        const headers = container.querySelectorAll('table thead th');
        
        const columns = container.querySelectorAll('.mocked_column');
        
        expect([...headers].map(t => t.innerHTML)).toStrictEqual([
            'Mon, April 3, 2023',
            'Tue, April 4, 2023',
            'Wed, April 5, 2023',
            'Thu, April 6, 2023',
            'Fri, April 7, 2023',
            'Sat, April 8, 2023',
            'Sun, April 9, 2023',
        ]);
        
    });
    
    test("Display hours in each row of the table", () => {

        const { container } = render(
            <Scheduler />
        );

        const rows = container.querySelectorAll('table tbody tr th');

        expect([...rows].map(t => t.innerHTML)).toStrictEqual([
            '00:00', '01:00', '02:00',
            '03:00', '04:00', '05:00',
            '06:00', '07:00', '08:00',
            '09:00', '10:00', '11:00',
            '12:00', '13:00', '14:00',
            '15:00', '16:00', '17:00',
            '18:00', '19:00', '20:00',
            '21:00', '22:00', '23:00'
        ]);
        
    });
});

describe('Scheduler - Passing columns dimensions to each item',  function() {
    
    const mockBoundingClientRects = function ()
    {
        const table = screen.getByRole('table');
        const tbody = table.querySelector('tbody');
        const headers = [...table.querySelectorAll('table thead th')];

        jest.spyOn(tbody, 'getBoundingClientRect').mockReturnValue(
            { left: 10, top: 20, width: 800, height: 300 }
        );

        const offsets = [100, 200, 300, 400, 500, 600, 700];
        for (let i in offsets) {
            jest.spyOn(headers[i], 'getBoundingClientRect').mockReturnValue(
                { left: offsets[i], width: 100  }
            );
        }
    };
    
    const expectedColumnsRects = [
        {left: 100, width: 100, top: 20, height: 300 },
        {left: 200, width: 100, top: 20, height: 300 },
        {left: 300, width: 100, top: 20, height: 300 },
        {left: 400, width: 100, top: 20, height: 300 },
        {left: 500, width: 100, top: 20, height: 300 },
        {left: 600, width: 100, top: 20, height: 300 },
        {left: 700, width: 100, top: 20, height: 300 }
    ];
    
    test("At initialization", () => {

        jest.spyOn(React, 'useEffect').mockImplementationOnce((...params) => {
            const [ fn, ...otherParams ] = params;
            return React.useEffect(() => {
                mockBoundingClientRects();
                return fn();
            }, ...otherParams);
        });

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting",
                        start: "2023-04-03 10:00",
                        end:   "2023-04-03 16:00"
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const event   = container.querySelector('.mocked_event');
        const columns = JSON.parse(event.getAttribute('data-columns'));

        expect(columns.map(c => c.rect)).toStrictEqual(expectedColumnsRects);
    });
    
    test("When resizing window", async () => {

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting",
                        start: "2023-04-03 10:00",
                        end:   "2023-04-03 16:00"
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        mockBoundingClientRects();
        await act(() => {
            window.dispatchEvent(new CustomEvent('resize'));
        });

        const event   = container.querySelector('.mocked_event');
        const columns = JSON.parse(event.getAttribute('data-columns'));
        
        expect(columns.map(c => c.rect)).toStrictEqual(expectedColumnsRects);
        
    });
    
});

test("Display events for the current week only", () => {
    
    const { container, debug } = render(
        <Scheduler 
            events      = { [
                {
                    label: "Meeting",
                    start: "2023-04-03 10:00",
                    end:   "2023-04-03 16:00"
                },
                {
                    label: "Past meeting",
                    start: "2023-01-03 10:00",
                    end:   "2023-01-03 16:00"
                },
                {
                    label: "Future meeting",
                    start: "2023-07-03 10:00",
                    end:   "2023-07-03 16:00"
                }
            ] } 
            currentDate = "2023-04-03" 
        />        
    );
    
    const events   = [...container.querySelectorAll('.mocked_event')];
    
    expect(events).toHaveLength(1);
    
    expect(events[0].getAttribute('data-event-label')).toBe("Meeting");
    expect(events[0].getAttribute('data-event-start')).toEqual(
        String(new Date("2023-04-03 10:00").getTime())
    );
    expect(events[0].getAttribute('data-event-end')).toEqual(
        String(new Date("2023-04-03 16:00").getTime())
    );

    
});

test("Scheduler - Passing columns data to each item", async () => {

    const { container, debug } = render(
        <Scheduler 
            events      = { [
                {
                    label: "Meeting",
                    start: "2023-04-03 10:00",
                    end:   "2023-04-03 16:00"
                }
            ] } 
            currentDate = "2023-04-03" 
        />        
    );

    const event   = container.querySelector('.mocked_event');
    const columns = JSON.parse(event.getAttribute('data-columns'));
    
    expect( columns.map( ({ data }) => data ) ).toStrictEqual([
        {
            min: new Date("2023-04-03 00:00:00").getTime(), 
            max: new Date("2023-04-03 24:00:00").getTime()
        },
        {
            min: new Date("2023-04-04 00:00:00").getTime(), 
            max: new Date("2023-04-04 24:00:00").getTime()
        },
        {
            min: new Date("2023-04-05 00:00:00").getTime(), 
            max: new Date("2023-04-05 24:00:00").getTime()
        },
        {
            min: new Date("2023-04-06 00:00:00").getTime(), 
            max: new Date("2023-04-06 24:00:00").getTime()
        },
        {
            min: new Date("2023-04-07 00:00:00").getTime(), 
            max: new Date("2023-04-07 24:00:00").getTime()
        },
        {
            min: new Date("2023-04-08 00:00:00").getTime(), 
            max: new Date("2023-04-08 24:00:00").getTime()
        },
        {
            min: new Date("2023-04-09 00:00:00").getTime(), 
            max: new Date("2023-04-09 24:00:00").getTime()
        },
    ]);

});

const render_timestamp = (ts) => {
    const date = new Date(ts);

    // date formating is too verbose. Maybe switch to moment.js ?
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + ' ' + 
           String(date.getHours()).padStart(2, '0') + ':' + 
           String(date.getMinutes()).padStart(2, '0');
}

