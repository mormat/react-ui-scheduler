
import { createRef, useEffect, useState } from 'react';

import DragAndDrop  from '../utils/drag-n-drop';

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
    
    const handleMouseDown = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        const step = 15 * 60 * 1000;
        if (action === 'move') {
            DragAndDrop.dragMoveHandle(e, {start, end, setStart, setEnd, columns, step});
        } else if (action === 'resize') {
            DragAndDrop.dragResizeHandle(e, {start, end, setEnd, columns, step});
        }
        
    }
    
    const { label, backgroundColor = "white", color } = value;
    
    return (
        <div className  = "react-ui-scheduler-event"
             style       = { { top, height, left, width, backgroundColor, color, position: "absolute", cursor: "move" } }
             onMouseDown = { e => handleMouseDown(e, 'move') }
        >
            <div className="react-ui-scheduler-eventHeader">
                { formatTime(start) } - { formatTime(end) }
            </div>
            <div className="react-ui-scheduler-eventBody">
                { label }
            </div>
            <div aria-label="resize event"  className = "react-ui-scheduler-resize-event"
                 onMouseDown = { e => handleMouseDown(e, 'resize') }
                 style = {{ position: 'absolute', width: '100%', height: '10px', bottom: 0, cursor: 'ns-resize'}}
            >
            </div>
        </div>
    )
    
}

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString().substring(0, 5);
}
    
export default SchedulerEvent