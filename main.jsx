import React         from 'react'
import ReactDOM      from 'react-dom/client'

import Scheduler     from './src/Scheduler';

function Demo( ) {
    
    const events = [
        {
            label: "Meeting",
            start: "2023-04-13 10:00",
            end:   "2023-04-13 16:00",
            color: "white",
            backgroundColor: "rgb(2, 136, 209)"
        },
        {
            label: "Another meeting",
            start: "2023-04-15 14:00",
            end:   "2023-04-15 16:00",
            color: "white",
            backgroundColor: "rgb(2, 136, 209)"
        }   
    ]
    
    return <Scheduler events = { events } />;
    
}

document.addEventListener("DOMContentLoaded", function() {

    const elt = document.getElementById('root');
    
    ReactDOM.createRoot(elt).render(
        <React.StrictMode>
            <Demo />
        </React.StrictMode>,
    )

});
