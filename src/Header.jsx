
import { createRef, useEffect, useState } from 'react';

import './Header.scss';

function Header( { date, onDateChange } ) {
    
    const [currentTimestamp, setCurrentTimestamp] = useState(date ? new Date(date).getTime() : Date.now());
    
    const handleTodayButton = () => {
        const timestamp = Date.now(); 
        setCurrentTimestamp(timestamp);
        onDateChange(new Date(timestamp));
    }
    
    const handlePreviousButton = () => {
        const timestamp = currentTimestamp - 7 * 24 * 60 * 60 * 1000; 
        setCurrentTimestamp(timestamp);
        onDateChange(new Date(timestamp));
    }
    
    const handleNextButton = () => {
        const timestamp = currentTimestamp + 7 * 24 * 60 * 60 * 1000; 
        setCurrentTimestamp(timestamp);
        onDateChange(new Date(timestamp));
    }
    
    return (
        <div className="scheduler-header">
            <button onClick= { handlePreviousButton } title="Previous week">
                &lt;
            </button>
            <button onClick= { handleTodayButton } >
                today
            </button>
            <button onClick= { handleNextButton } title="Next week" >
                &gt;
            </button>
        </div>
    )
    
}

export default Header