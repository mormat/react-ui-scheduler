
import { createRef, useEffect, useState } from 'react';

function SchedulerEvent( { value = {}, columns = [] }) {
    
    const [start,  setStart]  = useState(value.start);
    const [end,    setEnd]    = useState(value.end);
    const [left,   setLeft]   = useState(0);
    const [top,    setTop]    = useState(0);
    const [width,  setWidth]  = useState(0);
    const [height, setHeight] = useState(0);
    
    useEffect(() => {

        for (let { rect, data } of columns) {

            if (data['min'] <= start && start <= data['max']) {

                const total  = data['max'] - data['min'];
                const ratio  = rect.height / total;
                const truc   = start - data['min'];
                const length = end   - start;

                setLeft(rect.left);
                setWidth(rect.width);
                setHeight(length * ratio);
                setTop(truc * ratio + rect.top);
                
                
            }

        }
        
    }, [start, end, columns]);

    const { label, backgroundColor = "white", color } = value;
    
    return (
        <div style = { { top, height, left, width, backgroundColor, color, position: "absolute" } }
             
        >
        
            <small>{ formatTime(start) } - { formatTime(end) }</small>
            <br/>
            <strong>{ label }</strong> 
            <br/>
            
        </div>
    )
    
}

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString().substring(0, 5);
}
    
export default SchedulerEvent