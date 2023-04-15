/**
 * @jest-environment jsdom
 */

import {render, screen, fireEvent, act} from '@testing-library/react'
import '@testing-library/jest-dom';

require('jest-mock-now')(new Date('2023-04-17'));

import Scheduler from '../src/components/Scheduler';
import DomUtils  from '../src/utils/dom';

describe('Scheduler events', () => {

    beforeEach(() => {
        
        jest.spyOn(DomUtils, 'getHtmlTableInfos').mockReturnValue({
            offset: { left: 0, top: 0 },
            columns: [
                { left: 30, top: 10, width: 9, height: 240 },
                { left: 40, top: 10, width: 9, height: 240 },
                { left: 50, top: 10, width: 9, height: 240 },
                { left: 60, top: 10, width: 9, height: 240 },
                { left: 70, top: 10, width: 9, height: 240 },
                { left: 80, top: 10, width: 9, height: 240 },
                { left: 90, top: 10, width: 9, height: 240 }
            ]
        });
        
    });
    
    test("Show the current week by default", async() => {
        
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
    ])('If date is "%s", display the corresponding week', async (currentDate) => {
        
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
    
    test("Display scheduler events for the current week", async () => {

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting last week (should not be visible)",
                        start: "2023-03-27 10:00",
                        end:   "2023-03-27 16:00"
                    },
                    {
                        label: "Meeting this week",
                        start: "2023-04-03 10:00",
                        end:   "2023-04-03 16:00",
                    },
                    {
                        label: "Meeting next week (should not be visible)",
                        start: "2023-10-03 10:00",
                        end:   "2023-10-03 16:00"
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const events   = [...container.querySelectorAll('.react-ui-scheduler-event')];

        expect(events).toHaveLength(1);

        expect(events[0].textContent).toContain("10:00 - 16:00");
        expect(events[0].textContent).toContain("Meeting this week");

    });

    test("Custom colors of scheduler event", () => {
        
        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        start: "2023-04-03 10:00",
                        end:   "2023-04-03 16:00",
                        color: "white",
                        backgroundColor: "rgb(2, 136, 209)"
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const event   = container.querySelector('.react-ui-scheduler-event');

        expect(event).toHaveStyle("color: white");
        expect(event).toHaveStyle("background-color: rgb(2, 136, 209)");
        
    });


    test("Initial position and size of scheduler event", async () => {

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        start: "2023-04-03 10:00",
                        end:   "2023-04-03 16:00",
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const event   = container.querySelector('.react-ui-scheduler-event');

        expect(event).toHaveStyle("left:    30px");
        expect(event).toHaveStyle("width:    9px");
        expect(event).toHaveStyle("top:    110px");
        expect(event).toHaveStyle("height:  60px");


    });

    test("Position and size of scheduler event after resizing window", async () => {

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        start: "2023-04-03 10:00",
                        end:   "2023-04-03 16:00",
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const event   = container.querySelector('.react-ui-scheduler-event');

        jest.spyOn(DomUtils, 'getHtmlTableInfos').mockReturnValue({
            offset: { left: 0, top: 0 },
            columns: [
              { left: 3, top: 10, width: 1, height: 120 },
              { left: 4, top: 10, width: 1, height: 120 },
              { left: 5, top: 10, width: 1, height: 120 },
              { left: 6, top: 10, width: 1, height: 120 },
              { left: 7, top: 10, width: 1, height: 120 },
              { left: 8, top: 10, width: 1, height: 120 },
              { left: 9, top: 10, width: 1, height: 120 }
            ]
        });

        await windowResize();

        expect(event).toHaveStyle("left:    3px");
        expect(event).toHaveStyle("width:   1px");
        expect(event).toHaveStyle("top:     60px");
        expect(event).toHaveStyle("height:  30px");

    });

    test.each([
        [55,  20,  "01:00 - 07:00", '50px',  '20px'],
        [55,  200, "18:00 - 00:00", '50px', '190px'],
        [45,  110, "10:00 - 16:00", '40px', '110px'],
        [65,  110, "10:00 - 16:00", '60px', '110px'],
        [55,    0, "00:00 - 06:00", '50px',  '10px'],
        [55,  250, "18:00 - 00:00", '50px', '190px'],
        [0,   110, "10:00 - 16:00", '30px', '110px'],
        [200, 110, "10:00 - 16:00", '90px', '110px'],
        [55,  106, "09:30 - 15:30", '50px', '105px'], // checks that step is 15 minutes
    ])('Drag and drop scheduler event to (%s, %s)', async (posX, posY, expectedText, expectedLeft, expectedTop) => {

        const onEventChange = jest.fn();

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        start: "2023-04-05 10:00",
                        end:   "2023-04-05 16:00",
                    }
                ] } 
                currentDate   = "2023-04-03" 
                onEventChange = { onEventChange }
            />        
        );

        const diff = 10;

        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');
        fireEvent.mouseDown(schedulerEvent, {clientX: 55, clientY: 110 + diff} );

        await mouseMove( posX, posY + diff );
        expect(schedulerEvent.textContent).toContain(expectedText);
        expect(schedulerEvent).toHaveStyle(`left:    ${expectedLeft}`);
        expect(schedulerEvent).toHaveStyle("width:   9px");
        expect(schedulerEvent).toHaveStyle(`top:     ${expectedTop}`);
        expect(schedulerEvent).toHaveStyle("height:  60px");

        // Scheduler event has not been changed yet
        expect(onEventChange).toHaveBeenCalledTimes(0);

        await mouseUp( posX, posY + diff );

        // @todo checks that the event has been changed here 
        /*
        expect(onEventChange).toHaveBeenCalledWith(
            expect.objectContaining({
                label: "Meeting this week",
            })
        ) */

        // After dropping, the scheduler event remained unchanged if moving mouse
        await mouseMove( 55, 110 + diff );
        expect(schedulerEvent).toHaveStyle(`left:    ${expectedLeft}`);
        expect(schedulerEvent).toHaveStyle("width:   9px");
        expect(schedulerEvent).toHaveStyle(`top:     ${expectedTop}`);
        expect(schedulerEvent).toHaveStyle("height:  60px");
    });

    test.each([
        [55,  80,  "10:15", '2.5px'],
        [55,  200, "20:00", '100px'],
        [55,  300, "00:00", '140px'],
        [45,  200, "20:00", '100px'],
        [65,  200, "20:00", '100px'],
        [55,    0, "10:15", '2.5px'],
        [55,  250, "00:00", '140px'],
        [0,   110, "11:00", '10px'],
        [200, 110, "11:00", '10px'],
        [55,  182, "18:00", '80px'], // checks that step is 15 minutes
    ])('Move the resize handler of the scheduler event at (%s, %s)', async (posX, posY, expectedEndTime, expectedHeight) => {

        const onEventChange = jest.fn();

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        start: "2023-04-05 10:00",
                        end:   "2023-04-05 16:00",
                    }
                ] } 
                currentDate   = "2023-04-03" 
                onEventChange = { onEventChange }
            />        
        );

        const diff = 2;

        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');

        const resizeHandler = container.querySelector('.react-ui-scheduler-resize-event');
        fireEvent.mouseDown(resizeHandler, {clientX: 55, clientY: 160 + diff} );

        await mouseMove( posX, posY + diff);

        expect(schedulerEvent.textContent).toContain(`10:00 - ${expectedEndTime}`);
        expect(schedulerEvent).toHaveStyle("left:    50px");
        expect(schedulerEvent).toHaveStyle("width:   9px");
        expect(schedulerEvent).toHaveStyle("top:     110px");
        expect(schedulerEvent).toHaveStyle(`height:  ${expectedHeight}`);

        // Scheduler event has not been changed yet
        expect(onEventChange).toHaveBeenCalledTimes(0);

        await mouseUp( posX, posY + diff );

        // @todo checks that the event has been changed here 
        /*
        expect(onEventChange).toHaveBeenCalledWith(
            expect.objectContaining({
                label: "Meeting this week",
            })
        ) */

        // After dropping, the scheduler event remained unchanged if moving mouse
        expect(schedulerEvent.textContent).toContain(`10:00 - ${expectedEndTime}`);
        expect(schedulerEvent).toHaveStyle("left:    50px");
        expect(schedulerEvent).toHaveStyle("width:   9px");
        expect(schedulerEvent).toHaveStyle("top:     110px");
        expect(schedulerEvent).toHaveStyle(`height:  ${expectedHeight}`);
    });
    
});

// shortcuts for triggering events on window
const windowResize = () => act(() => {
    window.dispatchEvent(new CustomEvent('resize'));
});
const mouseMove = (clientX, clientY) => act(() => {
    window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
});
const mouseUp   = (clientX, clientY) => act(() => {
    window.dispatchEvent(new MouseEvent('mouseup', { clientX, clientY }));
});