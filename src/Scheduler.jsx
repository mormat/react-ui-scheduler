
import { createRef, useEffect, useState } from 'react';

import Header from './Header'
import DailyColumnsSheet from './DailyColumnsSheet'

import { getDaysOfWeek, getHoursBetween } from './date-utils';

import createEventsRepository from './events-managers';
import { overlaps } from './events-managers';



function Scheduler( config ) {
    
    const [currentDate, setCurrentDate] = useState(config.startDate);
    const [events,     setEvents] = useState([]);
    const [eventsRepository,]     = useState(() => createEventsRepository({
        type:   'array',
        items:  config.events || []
    }));
    
    const days  = getDaysOfWeek(currentDate);
    const hours = getHoursBetween(config.minHour || 0, config.maxHour || 24);
    
    const onEventChange = (schedulerEvent) => {
        if (isEventValid(schedulerEvent)) {
            eventsRepository.save(schedulerEvent);
        }
        setEvents(eventsRepository.load());
        
        if (config.onEventChanged) {
            config.onEventChanged(schedulerEvent);
        }
    }
    
    const isEventValid = (schedulerEvent) => {
        const overlappingEvents = events.filter(v => overlaps(schedulerEvent, v));
        return overlappingEvents.length === 0;
    }
    
    useEffect(() => {
        setEvents(eventsRepository.load());
    }, [currentDate]);
    
    return (
        <div className="mormat_react-scheduler">
            <Header 
                date         = { currentDate }
                onDateChange = { setCurrentDate }
            />
            <DailyColumnsSheet 
                days   = { days }  
                hours  = { hours }
                events = { events }
                options = { { ...config, onEventChange }}
            />
        </div>  
    )
    
}

export default Scheduler