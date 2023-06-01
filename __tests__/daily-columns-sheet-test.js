/**
 * @jest-environment jsdom
 */

import {render, screen, fireEvent, act} from '@testing-library/react'
import '@testing-library/jest-dom';

import DailyColumnsSheet from '../src/DailyColumnsSheet';

jest.mock("../src/DailyColumnsEvent", () => jest.fn());

import DailyColumnsEvent from '../src/DailyColumnsEvent';

const fixtures = {
    default_columns_layout: {
        left: 0, top: 0, width: 100, height: 240,
        children: [
            { left: 30, top: 80, width: 10, height: 165 }
        ]
    },
    small_columns_layout: {
        left: 0, top: 0, width: 100, height: 240,
        children: [
            { left: 15, top: 40, width: 5, height: 82.5 }
        ]
    }
}

describe('DailyColumnsSheet', () => {
    
    const defaultProps = {
        days : ["2023-04-03"],
        hours: [
            '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
            '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
        ]
    }
    
    beforeEach(() => {
        DailyColumnsEvent.mockReturnValue('');
    });
    
    afterEach(() => {
        DailyColumnsEvent.mockClear();
    });
    
    test("Show the current week by default", async() => {
        
        const { container, debug } = render(
            <DailyColumnsSheet 
                days= { [
                    '2023-04-03', 
                    '2023-04-04',
                    '2023-04-05',
                    '2023-04-06',
                    '2023-04-07',
                    '2023-04-08',
                    '2023-04-09',
                ] } 
            />
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
    
    test('i18n', async () => {
        
        const { container } = render(
            <DailyColumnsSheet 
                { ...defaultProps }
                options= { { locale: "fr" } }
            />
        );

        const headers = container.querySelectorAll('table thead th');
        
        const columns = container.querySelectorAll('.mocked_column');
        
        expect([...headers].map(t => t.innerHTML)).toStrictEqual([
            'lun. 3 avril 2023'
        ]);
        
    });
    
    test("Display the hour scale (Y-axis) with min and max value", () => {
        
        const { container } = render(
            <DailyColumnsSheet 
                { ...defaultProps }
            />
        );

        const y_axis = container.querySelectorAll('table tbody tr th');

        expect([...y_axis].map(t => t.innerHTML)).toStrictEqual([
            '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
            '15:00', '16:00', '17:00', '18:00', '19:00',
        ]);
        
    });
    
    test("Display events if match the provided days", async () => {

        const { container } = render(
            <DailyColumnsSheet 
                { ...defaultProps }
                events      = { [
                    {
                        label: "Meeting this week",
                        start: new Date("2023-04-03 10:00"),
                        end:   new Date("2023-04-03 16:00")
                    }
                ] } 
            />        
        );

        expect(DailyColumnsEvent).toHaveBeenCalled();
        const [ eventProps ] = DailyColumnsEvent.mock.calls.at(-1);

        expect(eventProps.value).toStrictEqual(
            expect.objectContaining({
                label: "Meeting this week",
                start: new Date("2023-04-03 10:00"),
                end:   new Date("2023-04-03 16:00")
            })
        );
        
    });
    
    test.each([
        [{}, "50px"],
        [{ rowHeight: 100 }, "100px"],
        [{ rowHeight: "100px" }, "100px"],
    ])("Custom row height %s", (options, height) => {
        
        const { container } = render(
            <DailyColumnsSheet 
                { ...defaultProps }
                options = { options }
            />
        );

        const rows = [...container.querySelectorAll('tbody tr')];
        
        const expected = Array(defaultProps.hours.length - 1).fill(height);
        
        expect(rows.map(t => t.style.height)).toStrictEqual(expected);
        
    });
    
    /*
    test.each([[1], [2]])("Ignore drag and drop if mouse button %s pressed", async (button) => {
        
        const { container, debug } = render(
            <DailyColumnsSheet 
                { ...defaultProps }
                events      = { [
                    {
                        label: "Meeting this week",
                        start: new Date("2023-04-03 10:00"),
                        end:   new Date("2023-04-03 16:00")
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );

        const schedulerEvent = container.querySelector('.react-ui-scheduler-event');
        fireEvent.mouseDown(schedulerEvent, { button });
        
        expect(startDrag).not.toHaveBeenCalled();

    });*/
    
    // @move this logic to eventsManager.isValid() 
    /*
    test("Prevent drag and drop of event over another event", async () => {
        
        const { container, debug } = render(
            <DailyColumnsSheet 
                { ...defaultProps }
                events      = { [
                    {
                        label: "Meeting",
                        start: new Date("2023-04-03 14:00"),
                        end:   new Date("2023-04-03 15:00")
                    },
                    {
                        label: "Another meeting",
                        start: new Date("2023-04-03 16:00"),
                        end:   new Date("2023-04-03 17:00")
                    }
                ] } 
                currentDate = "2023-04-03" 
            />        
        );
        
        const schedulerEvents = [...container.querySelectorAll('.react-ui-scheduler-event')];
        fireEvent.mouseDown(schedulerEvents[0]);
        
        const [dragHandler, subject, coord, notify] = startDrag.mock.calls[0];
                
        const hour = 60 * 60 * 1000;
        
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
        
    });
     * 
     */
    
});
