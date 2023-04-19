/**
 * @jest-environment jsdom
 */

import {render, screen, fireEvent, act} from '@testing-library/react'
import '@testing-library/jest-dom';

require('jest-mock-now')(new Date('2023-04-17'));

import Scheduler from '../src/Scheduler';
import DomUtils  from '../src/DomUtils';

const mockColumnInfos = ( {width = 10, height = 240, offsetX = 0, offsetY = 0} = {} ) => {
    
    const columnInfos = { y: 10 + offsetY, width, height, offsetX, offsetY };

    jest.spyOn(DomUtils, 'getHtmlTableColumnsInfos').mockReturnValue([
        { x: 3 * width + offsetX, ...columnInfos },
        { x: 4 * width + offsetX, ...columnInfos },
        { x: 5 * width + offsetX, ...columnInfos },
        { x: 6 * width + offsetX, ...columnInfos },
        { x: 7 * width + offsetX, ...columnInfos },
        { x: 8 * width + offsetX, ...columnInfos },
        { x: 9 * width + offsetX, ...columnInfos }
    ]);
    
}

describe('Scheduler', () => {

    beforeEach(() => {
        
        mockColumnInfos();
        
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
    
    test("Display all values in the hour scale (Y-axis)", () => {

        const { container } = render(
            <Scheduler />
        );

        const y_axis = container.querySelectorAll('table tbody tr th');

        expect([...y_axis].map(t => t.innerHTML)).toStrictEqual([
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
    
    test("Display the hour scale (Y-axis) with min and max value", () => {
        
        const { container } = render(
            <Scheduler minHour="08:00" maxHour="20:00" />
        );

        const y_axis = container.querySelectorAll('table tbody tr th');

        expect([...y_axis].map(t => t.innerHTML)).toStrictEqual([
            '08:00', '09:00', '10:00', 
            '11:00', '12:00', '13:00', 
            '14:00', '15:00', '16:00', 
            '17:00', '18:00', '19:00',
        ]);
        
    });
    
    
    test("Display scheduler events for the current week", async () => {

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting last week (should not be visible)",
                        date:  "2023-03-27",
                        startTime: "10:00",
                        endTime:   "16:00"
                    },
                    {
                        label: "Meeting this week",
                        date:  "2023-04-03",
                        startTime: "10:00",
                        endTime:   "16:00",
                    },
                    {
                        label: "Meeting next week (should not be visible)",
                        date:  "2023-10-03",
                        startTime: "10:00",
                        endTime:   "16:00"
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
                        date:  "2023-04-03",
                        startTime: "10:00",
                        endTime:   "16:00",
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
    
    test("If onEventChange() listener not in params, dropping an event should not trigger error", async () => {
        
        const { container } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        date:  "2023-04-03",
                        startTime: "10:00",
                        endTime:   "16:00",
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );


        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');
        fireEvent.mouseDown(schedulerEvent, {clientX: 55, clientY: 110} );
        
        await mouseUp();
        
    })
    
});

describe.each([
    [0,  0],
    [15, 20]
])('Scheduler at offset(%s, %s)', (offsetX, offsetY) => {

    beforeEach(() => {
        
        mockColumnInfos({offsetX, offsetY});
        
    });

    test("Initial position and size of scheduler event", async () => {

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        date:  "2023-04-03",
                        startTime: "10:00",
                        endTime:   "16:00",
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const event   = container.querySelector('.react-ui-scheduler-event');

        expect(event).toHaveStyle("left:    30px");
        expect(event).toHaveStyle("width:   10px");
        expect(event).toHaveStyle("top:    110px");
        expect(event).toHaveStyle("height:  60px");

    });
    
    test("Initial position and size of scheduler event with minHour and maxHour in hour scale", async () => {

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        date:  "2023-04-03",
                        startTime: "10:00",
                        endTime:   "16:00",
                    }
                ] } 
                currentDate = "2023-04-03" 
                minHour     = "08:00"
                maxHour     = "20:00"
            />        
        );

        const event   = container.querySelector('.react-ui-scheduler-event');

        expect(event).toHaveStyle("left:    30px");
        expect(event).toHaveStyle("width:   10px");
        expect(event).toHaveStyle("top:     50px");
        expect(event).toHaveStyle("height: 120px");


    });

    test("Position and size of scheduler event after resizing window", async () => {

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        date:  "2023-04-03",
                        startTime: "10:00",
                        endTime:   "16:00",
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const event   = container.querySelector('.react-ui-scheduler-event');
        
        mockColumnInfos( { width: 5, height: 120, offsetX, offsetY });

        await windowResize();

        expect(event).toHaveStyle("left:    15px");
        expect(event).toHaveStyle("width:   5px");
        expect(event).toHaveStyle("top:     60px");
        expect(event).toHaveStyle("height:  30px");

    });

    test.each([
        [55,  20,  "2023-04-05", "01:00", "07:00", '50px',  '20px'],
        [55,  200, "2023-04-05", "18:00", "00:00", '50px', '190px'],
        [45,  110, "2023-04-04", "10:00", "16:00", '40px', '110px'],
        [65,  110, "2023-04-06", "10:00", "16:00", '60px', '110px'],
        [55,    0, "2023-04-05", "00:00", "06:00", '50px',  '10px'],
        [55,  250, "2023-04-05", "18:00", "00:00", '50px', '190px'],
        [0,   110, "2023-04-03", "10:00", "16:00", '30px', '110px'],
        [200, 110, "2023-04-09", "10:00", "16:00", '90px', '110px'],
        [55,  106, "2023-04-05", "09:30", "15:30", '50px', '105px'], // checks that step is 15 minutes
    ])('Drag and drop scheduler event to (%s, %s)', async (relativeX, relativeY, expectedDate, expectedStartTime, expectedEndTime, expectedLeft, expectedTop) => {

        const onEventChange = jest.fn();

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        date:  "2023-04-05 ",
                        startTime: "10:00",
                        endTime:   "16:00",
                        customVar: "foo"
                    }
                ] } 
                currentDate   = "2023-04-03" 
                onEventChange = { onEventChange }
            />        
        );

        const diff = 10;

        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');
        fireEvent.mouseDown(schedulerEvent, {clientX: 55 + offsetX, clientY: 110 + offsetY + diff} );

        await mouseMove( relativeX + offsetX, relativeY + offsetY + diff );
        expect(schedulerEvent.textContent).toContain(expectedStartTime + ' - ' + expectedEndTime);
        expect(schedulerEvent).toHaveStyle(`left:    ${expectedLeft}`);
        expect(schedulerEvent).toHaveStyle("width:  10px");
        expect(schedulerEvent).toHaveStyle(`top:     ${expectedTop}`);
        expect(schedulerEvent).toHaveStyle("height:  60px");
        expect(schedulerEvent).toHaveClass('react-ui-scheduler-event-dragged')


        // Scheduler event has not been changed yet
        expect(onEventChange).toHaveBeenCalledTimes(0);

        await mouseUp( relativeX + offsetX, relativeY + offsetY + diff );
        expect(schedulerEvent).not.toHaveClass('react-ui-scheduler-event-dragged')

        expect(onEventChange).toHaveBeenCalledWith(
            expect.objectContaining({
                date:      expectedDate,
                startTime: expectedStartTime,
                endTime:   expectedEndTime,
                label:     "Meeting this week",
                customVar: "foo"
            })
        )
        

        // After dropping, the scheduler event remained unchanged if moving mouse
        await mouseMove( 55, 110 + diff );
        expect(schedulerEvent).toHaveStyle(`left:    ${expectedLeft}`);
        expect(schedulerEvent).toHaveStyle("width:   10px");
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
    ])('Move the resize handler of the scheduler event at (%s, %s)', async (relativeX, relativeY, expectedEndTime, expectedHeight) => {

        const onEventChange = jest.fn();

        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting this week",
                        date:  "2023-04-05",
                        startTime: "10:00",
                        endTime:   "16:00",
                        customVar: "foo"
                    }
                ] } 
                currentDate   = "2023-04-03" 
                onEventChange = { onEventChange }
            />        
        );

        const diff = 2;

        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');

        const resizeHandler = container.querySelector('.react-ui-scheduler-resize-event');
        fireEvent.mouseDown(resizeHandler, {clientX: 55 + offsetX, clientY: 160 + offsetY + diff} );

        await mouseMove( relativeX + offsetX, relativeY + offsetY + diff);

        expect(schedulerEvent.textContent).toContain(`10:00 - ${expectedEndTime}`);
        expect(schedulerEvent).toHaveStyle("left:    50px");
        expect(schedulerEvent).toHaveStyle("width:   10px");
        expect(schedulerEvent).toHaveStyle("top:     110px");
        expect(schedulerEvent).toHaveStyle(`height:  ${expectedHeight}`);

        // Scheduler event has not been changed yet
        expect(onEventChange).toHaveBeenCalledTimes(0);

        await mouseUp( relativeX, relativeY + diff );

        expect(onEventChange).toHaveBeenCalledWith(
            expect.objectContaining({
                date:      "2023-04-05",
                startTime: "10:00",
                endTime:   expectedEndTime,
                label:     "Meeting this week",
                customVar: "foo"
            })
        )

        // After dropping, the scheduler event remained unchanged if moving mouse
        expect(schedulerEvent.textContent).toContain(`10:00 - ${expectedEndTime}`);
        expect(schedulerEvent).toHaveStyle("left:    50px");
        expect(schedulerEvent).toHaveStyle("width:   10px");
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