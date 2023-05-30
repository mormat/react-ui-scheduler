/**
 * @jest-environment jsdom
 */


import {render, screen, fireEvent, act} from '@testing-library/react'
import '@testing-library/jest-dom';

import Scheduler from '../src/Scheduler';

jest.mock('../src/dom-utils', () => ({
    getColumnsLayout: jest.fn(),
    startDrag: jest.fn()
}));

jest.mock('../src/date-utils', () => ({
    getDaysOfWeek: jest.fn()
}));

import { startDrag, getColumnsLayout } from '../src/dom-utils';
import { getDaysOfWeek } from '../src/date-utils';

const fixtures = {
    default_columns_layout: {
        left: 0, top: 0, width: 100, height: 240,
        children: [
            { left: 30, top: 10, width: 10, height: 240 },
            { left: 40, top: 10, width: 10, height: 240 },
            { left: 50, top: 10, width: 10, height: 240 },
            { left: 60, top: 10, width: 10, height: 240 },
            { left: 70, top: 10, width: 10, height: 240 },
            { left: 80, top: 10, width: 10, height: 240 },
            { left: 90, top: 10, width: 10, height: 240 }
        ]
    },
    small_columns_layout: {
        left: 0, top: 0, width: 100, height: 240,
        children: [
            { left: 15, top: 10, width: 5, height: 120 },
            { left: 20, top: 10, width: 5, height: 120 },
            { left: 25, top: 10, width: 5, height: 120 },
            { left: 30, top: 10, width: 5, height: 120 },
            { left: 35, top: 10, width: 5, height: 120 },
            { left: 40, top: 10, width: 5, height: 120 },
            { left: 45, top: 10, width: 5, height: 120 }
        ]
    },
    'default_days_of_week':  [
        '2023-04-03',
        '2023-04-04',
        '2023-04-05',
        '2023-04-06',
        '2023-04-07',
        '2023-04-08',
        '2023-04-09',
    ],
    'days_of_week_for_2023-03-13': [
        '2023-03-13',
        '2023-03-14',
        '2023-03-15',
        '2023-03-16',
        '2023-03-17',
        '2023-03-18',
        '2023-03-19',
    ]
}


describe('Scheduler', () => {

    let startDragLastParams = {};

    beforeEach(() => {
        
        getColumnsLayout.mockReturnValue(fixtures['default_columns_layout']);
        
        getDaysOfWeek.mockImplementation((v) => {
            if (v === '2023-03-13') return fixtures['days_of_week_for_2023-03-13'];
            return fixtures['default_days_of_week'];
        });
        
        startDragLastParams = {}
        startDrag.mockImplementation(
            (draggingState, subject, e, notify) => {
                startDragLastParams = { draggingState, subject, e, notify }
            }
        );
        
    });
    
    test("Show the current week by default", async() => {
        
        const { container, debug } = render(
            <Scheduler />
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
    
    test('Show the current week at 2023-03-13', async () => {
        
        const { container, debug } = render(
            <Scheduler currentDate= '2023-03-13'/>
        );

        const headers = container.querySelectorAll('table thead th');
        
        const columns = container.querySelectorAll('.mocked_column');
        
        expect([...headers].map(t => t.innerHTML)).toStrictEqual([
            'Mon, March 13, 2023',
            'Tue, March 14, 2023',
            'Wed, March 15, 2023',
            'Thu, March 16, 2023',
            'Fri, March 17, 2023',
            'Sat, March 18, 2023',
            'Sun, March 19, 2023',
        ]);
        
    });
    
    test('i18n', async () => {
        
        const { container, debug } = render(
            <Scheduler locale="fr" />
        );

        const headers = container.querySelectorAll('table thead th');
        
        const columns = container.querySelectorAll('.mocked_column');
        
        expect([...headers].map(t => t.innerHTML)).toStrictEqual([
            'lun. 3 avril 2023',
            'mar. 4 avril 2023',
            'mer. 5 avril 2023',
            'jeu. 6 avril 2023',
            'ven. 7 avril 2023',
            'sam. 8 avril 2023',
            'dim. 9 avril 2023',
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
    
    test.each([
        [null,    "50px"],
        [100,     "100px"],
        ["100px", "100px"],
    ])("Custom row height %s", (rowHeight, expected) => {
        
        const { container, debug } = render(
            <Scheduler rowHeight= { rowHeight } />        
        );

        const rows = [...container.querySelectorAll('tbody tr')];
        
        const rowsHeights = rows.map(t => t.style.height);
        
        expect(rowsHeights).toStrictEqual(Array(24).fill(expected));
        
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
        
        mouseUp();
        
    })
   
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
        
        getColumnsLayout.mockReturnValue(fixtures['small_columns_layout']);
        
        windowResize();

        expect(event).toHaveStyle("left:    15px");
        expect(event).toHaveStyle("width:   5px");
        expect(event).toHaveStyle("top:     60px");
        expect(event).toHaveStyle("height:  30px");

    });
   
    test("Drag and drop should update scheduler event", () => {
        
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

        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');
        fireEvent.mouseDown(schedulerEvent);
        
        const { notify, subject, e } = startDragLastParams;
        
        act(() => notify('press', subject));
        expect(schedulerEvent).toHaveClass('react-ui-scheduler-event-draggable');
        
        const hour = 60 * 60 * 1000;
        
        // Moving dragged subject
        subject.start += 2 * hour;
        subject.end   += 2 * hour;
        act(() => notify('move', subject));
        expect(schedulerEvent.textContent).toContain('12:00 - 18:00');
        expect(schedulerEvent).toHaveStyle(`left:    50px`);
        expect(schedulerEvent).toHaveStyle("width:   10px");
        expect(schedulerEvent).toHaveStyle(`top:     130px`);
        expect(schedulerEvent).toHaveStyle("height:  60px");
        expect(schedulerEvent).toHaveClass('react-ui-scheduler-event-dragging');
        
        // Scheduler event has not been changed yet
        expect(onEventChange).toHaveBeenCalledTimes(0);
        
        // Releasing dragged subject
        subject.start += 2 * hour;
        subject.end   += 2 * hour;
        act(() => notify('release', subject));
        expect(schedulerEvent.textContent).toContain('14:00 - 20:00');
        expect(schedulerEvent).toHaveStyle(`left:    50px`);
        expect(schedulerEvent).toHaveStyle("width:   10px");
        expect(schedulerEvent).toHaveStyle(`top:     150px`);
        expect(schedulerEvent).toHaveStyle("height:  60px");
        expect(schedulerEvent).not.toHaveClass('react-ui-scheduler-event-dragging');
        
        expect(onEventChange).toHaveBeenCalledWith(
            expect.objectContaining({
                date:      "2023-04-05",
                startTime: "14:00",
                endTime:   "20:00",
                label:     "Meeting this week",
                customVar: "foo"
            })
        )
        
    });
    
    test("Disable drag and drop if 'draggable' is false in scheduler options", async () => {
        
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
                currentDate = "2023-04-03" 
                draggable   = { false }
            />        
        );

        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');
        fireEvent.mouseDown(schedulerEvent);
        
        expect(startDrag).not.toHaveBeenCalled();
    });
    
    test.each([[1], [2]])("Ignore drag and drop if mouse button %s pressed", async (button) => {
        
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
                currentDate = "2023-04-03" 
            />        
        );

        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');
        fireEvent.mouseDown(schedulerEvent, { button });
        
        expect(startDrag).not.toHaveBeenCalled();

    });
    
    test("Prevent drag and drop of event over another event", async () => {
        
        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting",
                        date:  "2023-04-03",
                        startTime: "14:00",
                        endTime:   "15:00",
                        customVar: "foo"
                    },
                    {
                        label: "Another meeting",
                        date:  "2023-04-03",
                        startTime: "16:00",
                        endTime:   "17:00",
                        customVar: "foo"
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );
        
        const schedulerEvents = [...container.querySelectorAll('.react-ui-scheduler-event')];
        fireEvent.mouseDown(schedulerEvents[0]);
        
        const hour = 60 * 60 * 1000;
        
        let { notify, subject } = startDragLastParams;
        
        subject.start += 2 * hour;
        subject.end   += 2 * hour;
        act(() => notify('move', subject));
        expect(schedulerEvents[0].textContent).toContain('16:00 - 17:00');
        expect(schedulerEvents[0]).toHaveClass('react-ui-scheduler-event-dragging-forbidden');
        
        subject.start -= 3 * hour;
        subject.end   -= 3 * hour;
        act(() => notify('move', subject));
        expect(schedulerEvents[0].textContent).toContain('13:00 - 14:00');
        expect(schedulerEvents[0]).not.toHaveClass('react-ui-scheduler-event-dragging-forbidden');
        
        subject.start += 3 * hour;
        subject.end   += 3 * hour;
        act(() => notify('release', subject));
        expect(schedulerEvents[0].textContent).toContain('14:00 - 15:00');
        expect(schedulerEvents[0]).not.toHaveClass('react-ui-scheduler-event-dragging-forbidden');
        
        // move 2nd event to 18:00-19:00
        fireEvent.mouseDown(schedulerEvents[1]);
        ({ notify, subject } = startDragLastParams);
        
        subject.start += 2 * hour;
        subject.end   += 2 * hour;
        act(() => notify('move', subject));
        act(() => notify('release', subject));
        expect(schedulerEvents[1].textContent).toContain('18:00 - 19:00');

        // moving 1rst event to 18:00-19:00 should fail
        fireEvent.mouseDown(schedulerEvents[0]);
        ({ notify, subject } = startDragLastParams);

        subject.start += 4 * hour;
        subject.end   += 4 * hour;
        act(() => notify('move', subject));
        act(() => notify('release', subject));
        expect(schedulerEvents[0].textContent).toContain('14:00 - 15:00');
        
    })
   
    afterEach(() => {
        startDrag.mockClear();
    });
    
});



/*

describe.each([
    [0,  0],
    [15, 20]
])('Scheduler at offset(%s, %s)', (offsetX, offsetY) => {

    beforeEach(() => {
        
        mockColumnInfos({offsetX, offsetY});
        
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
        expect(schedulerEvent).toHaveClass('react-ui-scheduler-event-draggable');
        fireEvent.mouseDown(schedulerEvent, {clientX: 55 + offsetX, clientY: 110 + offsetY + diff} );

        mouseMove( relativeX + offsetX, relativeY + offsetY + diff );
        expect(schedulerEvent.textContent).toContain(expectedStartTime + ' - ' + expectedEndTime);
        expect(schedulerEvent).toHaveStyle(`left:    ${expectedLeft}`);
        expect(schedulerEvent).toHaveStyle("width:  10px");
        expect(schedulerEvent).toHaveStyle(`top:     ${expectedTop}`);
        expect(schedulerEvent).toHaveStyle("height:  60px");
        expect(schedulerEvent).toHaveClass('react-ui-scheduler-event-dragging')


        // Scheduler event has not been changed yet
        expect(onEventChange).toHaveBeenCalledTimes(0);

        mouseUp( relativeX + offsetX, relativeY + offsetY + diff );
        expect(schedulerEvent).not.toHaveClass('react-ui-scheduler-event-dragging')

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
        mouseMove( 55, 110 + diff );
        expect(schedulerEvent).toHaveStyle(`left:    ${expectedLeft}`);
        expect(schedulerEvent).toHaveStyle("width:   10px");
        expect(schedulerEvent).toHaveStyle(`top:     ${expectedTop}`);
        expect(schedulerEvent).toHaveStyle("height:  60px");
    });
    
    test("Prevent drag and drop of event over another event", async () => {
        
        const { container, debug } = render(
            <Scheduler 
                events      = { [
                    {
                        label: "Meeting",
                        date:  "2023-04-03",
                        startTime: "10:00",
                        endTime:   "12:00",
                        customVar: "foo"
                    },
                    {
                        label: "Another meeting",
                        date:  "2023-04-03",
                        startTime: "16:00",
                        endTime:   "18:00",
                        customVar: "foo"
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const diff = 10;

        const schedulerEvents = [...container.querySelectorAll('.react-ui-scheduler-event')];

        fireEvent.mouseDown(schedulerEvents[0], {clientX: 35 + offsetX, clientY: 110 + offsetY + diff} );
        
        // try to drop first event on second event
        mouseMove( 35 + offsetX, 170 + offsetY + diff );
        expect(schedulerEvents[0]).toHaveClass('react-ui-scheduler-event-dragging-forbidden');
        mouseUp( 35 + offsetX, 170 + offsetY + diff );
        expect(schedulerEvents[0].textContent).toContain('10:00 - 12:00');
        
        // moving the first event to 08:00
        fireEvent.mouseDown(schedulerEvents[0], {clientX: 35 + offsetX, clientY: 100 + offsetY + diff} );
        mouseMove( 35 + offsetX, 80 + offsetY + diff );
        expect(schedulerEvents[0]).not.toHaveClass('react-ui-scheduler-event-dragging-forbidden');
        mouseUp( 35 + offsetX, 80 + offsetY + diff );
        expect(schedulerEvents[0].textContent).toContain('08:00 - 10:00');
        
        // moving the second event to 14:00
        fireEvent.mouseDown(schedulerEvents[1], {clientX: 35 + offsetX, clientY: 160 + offsetY + diff} );
        mouseMove( 35 + offsetX, 140 + offsetY + diff );
        expect(schedulerEvents[0]).not.toHaveClass('react-ui-scheduler-event-dragging-forbidden');
        mouseUp( 35 + offsetX, 140 + offsetY + diff );
        expect(schedulerEvents[1].textContent).toContain('14:00 - 16:00');
        
        // try to drop first event on second event
        fireEvent.mouseDown(schedulerEvents[0], {clientX: 35 + offsetX, clientY: 80 + offsetY + diff} );
        mouseMove( 35 + offsetX, 130 + offsetY + diff );
        expect(schedulerEvents[0]).toHaveClass('react-ui-scheduler-event-dragging-forbidden');
        mouseUp( 35 + offsetX, 130 + offsetY + diff );
        expect(schedulerEvents[0].textContent).toContain('08:00 - 10:00');
        
        const resizeHandlers = [...container.querySelectorAll('.react-ui-scheduler-resize-event')];
        
        // try to resize the first event over the second event
        fireEvent.mouseDown(resizeHandlers[0], {clientX: 55 + offsetX, clientY: 100 + offsetY - 2} );
        mouseMove( 35 + offsetX, 150 + offsetY - 2 );
        expect(resizeHandlers[0]).toHaveClass('react-ui-scheduler-event-resizing-forbidden');
        mouseUp( 35 + offsetX, 150 + offsetY - 2 );
        expect(schedulerEvents[0].textContent).toContain('08:00 - 10:00');
    })


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
        expect(resizeHandler).toHaveClass('react-ui-scheduler-event-resizable');
        fireEvent.mouseDown(resizeHandler, {clientX: 55 + offsetX, clientY: 160 + offsetY + diff} );

        mouseMove( relativeX + offsetX, relativeY + offsetY + diff);

        expect(schedulerEvent.textContent).toContain(`10:00 - ${expectedEndTime}`);
        expect(schedulerEvent).toHaveStyle("left:    50px");
        expect(schedulerEvent).toHaveStyle("width:   10px");
        expect(schedulerEvent).toHaveStyle("top:     110px");
        expect(schedulerEvent).toHaveStyle(`height:  ${expectedHeight}`);
        expect(resizeHandler).toHaveClass('react-ui-scheduler-event-resizing');

        // Scheduler event has not been changed yet
        expect(onEventChange).toHaveBeenCalledTimes(0);

        mouseUp( relativeX, relativeY + diff );
        expect(resizeHandler).not.toHaveClass('react-ui-scheduler-event-resizing');
        
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

*/

// shortcuts for triggering events on window

//@deprecated
const windowResize = () => act(() => {
    window.dispatchEvent(new CustomEvent('resize'));
});

//@deprecated
const mouseUp   = (clientX, clientY) => act(() => {
    window.dispatchEvent(new MouseEvent('mouseup', { clientX, clientY }));
});