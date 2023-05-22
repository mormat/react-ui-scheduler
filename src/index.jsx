import React         from 'react'
import ReactDOM      from 'react-dom'

import Scheduler     from './Scheduler';

window.scheduler = {
    
    bind: (selector, {events = [], minHour, maxHour} = {}) => {
        
        // const element = ;
        
        ReactDOM.render(
            <React.StrictMode>
                <Scheduler events  = { events  } 
                           minHour = { minHour } 
                           maxHour = { maxHour }
                           draggable = { true }
                />
            </React.StrictMode>,
            document.querySelector(selector)
        );
        
    }
    
}
