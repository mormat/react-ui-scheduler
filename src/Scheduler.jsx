
import { createRef, useEffect, useState } from 'react';

import SchedulerEvent   from './SchedulerEvent';

import DomUtils from './DomUtils';

function Scheduler( { currentDate, onEventChange, events = [], minHour = "00:00", maxHour = "24:00"} ) {
    
    const [columns, setColumns] = useState([]);
    const parentRef             = createRef();
    
    const days   = getDays(currentDate, minHour,  maxHour);
    const hours  = getVerticalAxisLabels(minHour, maxHour, 60);
    
    const start  = Math.min(...days.map(t => t.min));
    const end    = Math.max(...days.map(t => t.max));
    
    const filteredEvents = events.map(cleanEvent).filter(event => {
        return event.start >= start && event.end <= end
    });
    
    useEffect(() => {
        
        const parentElement = parentRef.current;
        
        const resize = () => {
            
            const columns = DomUtils.getHtmlTableColumnsInfos(parentElement);
            
            setColumns(columns.map( (column, index) => {
                
                const min = days[index].min;
                const max = days[index].max;

                return { ...column, data: { min, max } }
                
            }));

        }
        
        resize();
        window.addEventListener('resize', resize);
        
        // @todo test that resize event has been removed
        return () => {
            window.removeEventListener('resize', resize);
        }
        
    }, []);
    
    const handleEventDrop = (event) => {
        if (onEventChange) {
            const { start, end, ...otherValues } = event;

            const z = new Date().getTimezoneOffset() * 60 * 1000;
            const range = [start, end].map( ts => new Date(ts - z).toISOString());

            const date      = range[0].substring(0, 10);
            const startTime = range[0].substring(11, 16);
            const endTime   = range[1].substring(11, 16);

            onEventChange({ date, startTime, endTime, ...otherValues})
        }
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
                                { new Date(min).toLocaleString('en', formatDateOptions) }
                            </th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    { hours.map(hour => (
                        <tr key = { hour }>
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
        
            { columns.map( ( {x, y, width, height, offsetX, offsetY}, index) => (
                <div key = { index } 
                     className = "react-ui-scheduler-column"
                     style = { { position: "absolute", left: x - offsetX, top: y - offsetY, width, height } }
                >
            
                </div>
            )) }
        
            { filteredEvents.map( (event, index)  => (
                <div key = { index }>
                    <SchedulerEvent 
                        value   = { event } 
                        columns = { columns } 
                        onDrop  = { handleEventDrop }
                    />
                </div>
            )) }
    
        </div>
                
    )
    
}

const formatDateOptions = {
    weekday: 'short', 
    year:    'numeric', 
    month:   'long', 
    day:     'numeric' 
}

const cleanEvent = (event) => {
    const { date, startTime, endTime, ...otherValues } = event;
    
    return {
        start: new Date(date + " " + startTime).getTime(),
        end:   new Date(date + " " + endTime).getTime(),
        ...otherValues
    }
}

const getDays = (currentDate, minHour, maxHour) => {
    const days    = [];
    
    const date   = new Date(currentDate || Date.now());
    let   monday = date.getDate() - date.getDay();
    
    // adjust when day is sunday
    if (date.getDay() === 0) {
        monday -= 7;
    }
    
    for (let i = 1; i <= 7; i++) {
        date.setDate(monday + i);
    
        const key   = date.toISOString().substring(0, 10);
        const min = new Date(key + ' ' + minHour + ':00').getTime();
        const max = new Date(key + ' ' + maxHour + ':00').getTime();
        
        days.push({ key, min, max });
    }
    return days;
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

export default Scheduler