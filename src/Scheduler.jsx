
import { createRef, useEffect, useState } from 'react';

import SchedulerEvent   from './SchedulerEvent';

import DomUtils from './DomUtils';

function Scheduler( { currentDate, events = [] } ) {
    
    const [columns, setColumns] = useState([]);
    const parentRef             = createRef();
    
    const days   = getDays(currentDate);
    const hours  = getHours(60);
    
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
        
            { filteredEvents.map( (event, index)  => (
                <div key = { index }>
                    <SchedulerEvent value = { event } columns = { columns } />
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
    const { start, end, ...otherValues } = event;
    
    return {
        start: new Date(start).getTime(),
        end:   new Date(end).getTime(),
        ...otherValues
    }
}

const getDays = (currentDate) => {
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
        const min = new Date(key + ' 00:00:00').getTime();
        const max = new Date(key + ' 24:00:00').getTime();
        
        days.push({ key, min, max });
    }
    return days;
}

const getHours = (minutesGap = 60) => {
    const hours = [];
    
    for (let t = 0; t < 24 * 60; t += minutesGap) {
        
        hours.push(new Date(t * 60 * 1000).toISOString().slice(11, 16));
    }
    
    return hours
}

export default Scheduler