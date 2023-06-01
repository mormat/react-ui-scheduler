
import { createRef, useEffect, useState } from 'react';

import SchedulerEvent   from './SchedulerEvent';

import { getColumnsLayout } from './dom-utils';

import { getDaysOfWeek } from './date-utils';

import { Column, ColumnCollection, MagneticGridDecorator, OffsetRelativeDragHandlerDecorator } from './areas';

import { createDragHandler } from './drag-handlers';

const defaults = {
    events:  [],
    minHour: '00:00',
    maxHour: '24:00',
    locale:  'en',
    draggable: true,
}

function Scheduler( props ) {
    
    const { 
        currentDate, 
        onEventChange, 
        events, 
        minHour, 
        maxHour, 
        rowHeight, 
        locale, 
        draggable 
    } = {...defaults, ...props}
    
    const parentRef             = createRef();
    const [area,  setArea]      = useState();
    const [dragHandler, setDragHandler] = useState({});
    const [columnsLayout, setColumnsLayout] = useState({});
    
    const days   = getDaysOfWeek(currentDate).map(day => ({
        min: new Date(day + ' ' + minHour + ':00').getTime(), 
        max: new Date(day + ' ' + maxHour + ':00').getTime()
    }));
    const hours  = getVerticalAxisLabels(minHour, maxHour, 60);
    
    const start  = Math.min(...days.map(t => t.min));
    const end    = Math.max(...days.map(t => t.max));
    
    const cleanEvents = (events) => {
        
        const cleaned = events.map((event) => {
            const { date, startTime, endTime, ...otherValues } = event;

            return {
                start: new Date(date + " " + startTime).getTime(),
                end:   new Date(date + " " + endTime).getTime(),
                ...otherValues
            }
        });
                
        return cleaned.filter(event => {
            return event.start >= start && event.end <= end
        });
        
    };
    
    const [cleanedEvents, setCleanedEvents] = useState(cleanEvents(events));
    
    useEffect(() => {
        
        const parentElement = parentRef.current;
        
        const resize = () => {
            
            const columnsLayout = getColumnsLayout(parentElement);
            
            const constraints = (days.map(({min, max}) => ({min, max})));
            columnsLayout.children.forEach((v,k) => {
                v.data = constraints[k]
            })
            
            setColumnsLayout(columnsLayout);
            
            let area = new ColumnCollection(
                columnsLayout.children.map(function({left, top, width, height}, index) {
                    return new Column({x: left, y: top, width, height}, constraints[index]);
                })        
            );
    
            area = new MagneticGridDecorator(area, 15 * 60 * 1000);
            area = new OffsetRelativeDragHandlerDecorator(area, parentElement);
    
            const dragHandler = createDragHandler({
                minLength: 15 * 60 * 1000,
                area, constraints
            });
    
            setDragHandler(dragHandler);
            
            setArea(area);
            
        }
        
        resize();
        // window.addEventListener('resize', resize);
        
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(parentElement);
        
        // @todo test that resize event has been removed
        return () => {
            // window.removeEventListener('resize', resize);
            resizeObserver.unobserve(parentElement);
        }
        
        
        
    }, []);
    
    const handleEventDrop = (newValues, initial) => {
        if (onEventChange) {
            const { start, end, ...otherValues } = newValues;

            const z = new Date().getTimezoneOffset() * 60 * 1000;
            const range = [start, end].map( ts => new Date(ts - z).toISOString());

            const date      = range[0].substring(0, 10);
            const startTime = range[0].substring(11, 16);
            const endTime   = range[1].substring(11, 16);

            onEventChange({ date, startTime, endTime, ...otherValues});
        }
        
        const updatedEvents = cleanedEvents.map(e => {
            return e === initial ? newValues : e;
        });
        setCleanedEvents(updatedEvents);
    }
    
    return (
        <div ref = { parentRef } style = { { position: "relative" } } >
            <table style = { { width: "100%" } } 
                   role  = "table"
                   className="react-ui-scheduler-table"
            >
                <thead> 
                    <tr>
                        <td></td>
                        { days.map( ({ key, min }, index) => (
                            <th key = { index } >
                                { new Date(min).toLocaleString(locale, formatDateOptions) }
                            </th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    { hours.map(hour => (
                        <tr key = { hour } style = { { height: rowHeight || 50 }}>
                            <th>
                                { hour }
                            </th>
                            { days.map( ({ key }, index) => (
                                <td key = { index } >
                                </td>
                            )) }
                        </tr>
                    )) }
                </tbody>
            </table>
        
            { (columnsLayout.children || []) .map( ( {left, top, width, height}, index) => (
                <div key = { index } 
                     className = "react-ui-scheduler-column"
                     style = { { position: "absolute", left, top, width, height } }
                >
            
                </div>
            )) }
        
            { cleanedEvents.map( (event, index)  => (
                <div key = { index }>
                    <SchedulerEvent 
                        value   = { event } 
                        onDrop  = { (values) => handleEventDrop(values, event) }
                        draggable = { draggable }
                        events    = { cleanedEvents }
                        dragHandler = { dragHandler }
                        columnsLayout = { columnsLayout }
                    />
                </div>
            )) }
    
            <Debug area= { area } />
    
            { /*
            
             */ }
    
        </div>
                
    )
    
}

const formatDateOptions = {
    weekday: 'short', 
    year:    'numeric', 
    month:   'long', 
    day:     'numeric',
}

const cleanEvent = (event) => {
    const { date, startTime, endTime, ...otherValues } = event;
    
    return {
        start: new Date(date + " " + startTime).getTime(),
        end:   new Date(date + " " + endTime).getTime(),
        ...otherValues
    }
}

const getVerticalAxisLabels = (minHour, maxHour, minutesGap = 60) => {

    const labels = [];

    const start = Number(minHour.split(':')[0]) * 60;
    const limit = Number(maxHour.split(':')[0]) * 60;

    for (let t = start; t < limit; t += minutesGap) {

        labels.push(new Date(t * 60 * 1000).toISOString().slice(11, 16));
    }

    return labels
}

function Debug( { area } )
{
    const [label, setLabel] = useState('waiting ...');
    
    
    useEffect(() => {

        const n = Math.floor(Math.random() * 100);

        const mousemove = function(e) {
            let label = '???';
            if (area) {
                const val = area.getValueAtCoord(e);
                label = new Date(val).toLocaleString('fr', formatDateOptions + {
                    hour:    'numeric',
                    minute:  'numeric',
                });
            }
            setLabel(label);
        }
        window.addEventListener('mousemove', mousemove);
         
        return () => {
            window.removeEventListener('mousemove', mousemove);
        }
         
    }, [area]);
    
    return (
        <h4>{ label }</h4>
    );
}

export default Scheduler