
import { createRef, useEffect, useState } from 'react';

import {startDrag}  from './dom-utils';

function SchedulerEvent( { value = {}, onDrop, draggable, events, dragHandler, columnsLayout }) {
    
    const [rect,   setRect]  = useState({});
    const [range,  setRange] = useState({start: value.start, end: value.end});
    const [draggingState, setDraggingState] = useState('');
    
    useEffect(() => {

        const { start, end } = range;

        for (let {left, top, width, height, data } of (columnsLayout.children || [])) {
            const { min, max } = data ;
            
            if (min <= start && start <= max) {
                const ratio = height / (max - min);
                
                top = (start - min) * ratio + top;
                height = (end - start) * ratio;
                
                setRect({ left, top, width, height });
            }
        }
        
    }, [range, columnsLayout]);
    
    useEffect(() => {
        if (draggingState === 'release') {
            if (isOverlapping()) {
                const {start, end } = value;
                setRange({start, end});
            } else {
                const {start, end } = range;
                onDrop({...value, start, end})
            }
        }
        
    }, [draggingState]);
    
    const handleMouseDown = (e, action) => {
        
        e.preventDefault();
        e.stopPropagation();
        if (e.button !== 0 || !draggable) {
            return;
        }
        
        const subject = { strategy: action, ...range }
        
        startDrag(dragHandler, subject, e, (draggingState) => {
            setDraggingState(draggingState);
            const {start, end} = subject;
            setRange({start, end});
        });
        
    }
    
    const getMoveableItemClasses = () => {
        let classes = [];
        if (draggable) {
            classes.push('react-ui-scheduler-event-draggable');
        }
        if (['press', 'move'].includes(draggingState)) {
            classes.push('react-ui-scheduler-event-dragging');
            if (isOverlapping()) {
                classes.push('react-ui-scheduler-event-dragging-forbidden');
            }
        }
        
        return classes.join(' ');
    }
    
    const getResizableItemClasses = () => {
        let classes = [];
        if (draggable) {
            classes.push('react-ui-scheduler-event-resizable');
        }
        if (draggingState  === 'press') {
            classes.push('react-ui-scheduler-event-resizing');
            if (isOverlapping()) {
                classes.push('react-ui-scheduler-event-resizing-forbidden');
            }
        }
        return classes.join(' ');
    }
    
    const isOverlapping = () => {
        for (let event of events) {
            if (event === value) continue;
            if ( !(range.end - 1 < event.start || event.end - 1 < range.start) ) {
                return true;
            }
        }
        return false;
    }
    
    const { label, backgroundColor = "white", color } = value;
    
    return (
        <div className  = { "react-ui-scheduler-event " + getMoveableItemClasses() }
             style       = { { ...rect, backgroundColor, color, position: "absolute" } }
             onMouseDown = { e => handleMouseDown(e, 'move') }
        >
            <div className="react-ui-scheduler-eventHeader">
                { formatTime(range.start) } - { formatTime(range.end) }
            </div>
            <div className="react-ui-scheduler-eventBody">
                { label }
            </div>
            <div aria-label="resize event"  
                 className = { "react-ui-scheduler-resize-event " + getResizableItemClasses() }
                 onMouseDown = { e => handleMouseDown(e, 'resize') }
                 style = {{ position: 'absolute', width: '100%', height: '10px', bottom: 0 }}
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