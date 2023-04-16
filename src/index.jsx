import React         from 'react'
import ReactDOM      from 'react-dom/client'

import Scheduler     from './Scheduler';

window.scheduler = {
    
    bind: (selector, {events = []} = {}) => {
        
        const element = document.querySelector(selector);
        
        ReactDOM.createRoot(element).render(
            <React.StrictMode>
                <Scheduler events = { events } />
            </React.StrictMode>,
        );
        
    }
    
}
