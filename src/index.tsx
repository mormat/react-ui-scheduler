import React         from 'react'
import ReactDOM      from 'react-dom'

import Scheduler     from './Scheduler';

import { SchedulerConfig } from './types';

window.scheduler = {
    
    bind: (selector: string, config: SchedulerConfig = {}) => {
        
        // const element = ;
        
        ReactDOM.render(
            <React.StrictMode>
                <Scheduler { ...config } />
            </React.StrictMode>,
            document.querySelector(selector)
        );
        
    }
    
}
