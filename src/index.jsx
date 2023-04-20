import React         from 'react'
import ReactDOM      from 'react-dom/client'

import Scheduler     from './Scheduler';

window.scheduler = {
    
    bind: (selector, {events = [], minHour, maxHour} = {}) => {
        
        const element = document.querySelector(selector);
        
        ReactDOM.createRoot(element).render(
            <React.StrictMode>
                <Scheduler events  = { events  } 
                           minHour = { minHour } 
                           maxHour = { maxHour }
                           draggable = { true }
                />
            </React.StrictMode>,
        );
        
    }
    
}
