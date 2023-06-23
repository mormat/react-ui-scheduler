import { createRef, useEffect, useState, Fragment } from 'react';

import './DailyColumnsEvent.scss';

// @todo 'draggable' is lame. use 'dragHandler != null' instead
function DailyColumnsEvent( { value, columnsLayout, dragHandler, draggable, onEventChanged, eventOffset } ) {
        
    const [rect,   setRect]   = useState(null);
    const [header, setHeader] = useState('');
    const [range,  setRange]  = useState({start: value.start, end: value.end});
    const [draggingState, setDraggingState] = useState(''); // @todo rename to dragInfos ?
    
    useEffect(() => {

        init();
        
        const { element } = columnsLayout;
        
        if (element) {
            element.addEventListener('react-ui-scheduler_resize', init);
        }
        
        return () => {
            if (element) {
                element.removeEventListener('react-ui-scheduler_resize', init);
            }
        }
        
    }, [columnsLayout, value]);
    
    
    const init = () => {
        
        const { start, end } = value;
        
        let rect = null;

        for (const { element } of (columnsLayout.children || [])) {
            
            const min = new Date(element.dataset.datemin);
            const max = new Date(element.dataset.datemax);
            
            if (min <= start && start <= max) {
        
                const columnRect = element.getBoundingClientRect();
                const parentRect = columnsLayout.element.getBoundingClientRect();
                const ratio = columnRect.height / (max - min);
                
                const { current = 0, length = 1} = eventOffset || {};
                
                rect = {
                    left: (columnRect.left - parentRect.left) + current * (columnRect.width / length),
                    top: (start - min) * ratio + columnRect.top - parentRect.top,
                    width: columnRect.width / length,
                    height: (end - start) * ratio
                }
        
            }
        }

        setRect(rect);
        
        setHeader(formatTime(value.start) + ' - ' +formatTime(value.end))
        
    }
    
    const getMainClasses = () => {
        let classes = [];
        if (draggable) {
            classes.push('moveable-scheduler-event');
        }
        if (['press', 'move'].includes(draggingState)) {
            classes.push('moving-scheduler-event');
            /* if (isOverlapping()) {
                classes.push('forbidden');
            } */
        }
        
        return classes.join(' ');
    }
    
    const getResizeHandlerClasses = () => {
        let classes = [];
        if (draggable) {
            classes.push('resizable-scheduler-event');
        }
        if (['press', 'move'].includes(draggingState)) {
            classes.push('resizing-scheduler-event');
            /* if (isOverlapping()) {
                classes.push('forbidden');
            }*/
        }
        return classes.join(' ');
    }
    
    const handleMouseDown = (e, behavior) => {
        
        e.preventDefault();
        e.stopPropagation();
        if (e.button !== 0) {
            return;
        }
        
        const subject = value;
        const listener  = () => init();
        
        if (dragHandler) {
            dragHandler.press(e, subject, { behavior, listener });
            setDraggingState("press");
            
            const mousemove = (e) => {
                dragHandler.move(e, subject, { behavior, listener });
                setDraggingState("move");
            }
            const mouseup = (e) => {
                dragHandler.release(e, subject, { behavior, listener });
                setDraggingState("release");

                window.removeEventListener('mousemove', mousemove);
                window.removeEventListener('mouseup',   mouseup);
            }

            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup',   mouseup);
            
        }
        
    }
    
    useEffect(() => {
        if (draggingState === 'release' && onEventChanged) {
            onEventChanged(value)    
        }
        
    }, [draggingState]);
    
    
    const { label, backgroundColor = "white", color } = value;
    
    if (rect === null) {
        return (<div/>);        
    }
    
    return (
        <div className="daily-columns-event">
            <div className  = { "react-ui-scheduler-event " + getMainClasses() }
                 onMouseDown = { e => handleMouseDown(e, 'moving') }
                 style       = { { ...rect, backgroundColor, color, position: "absolute" } }
            >
                <div className="scheduler-event-header">
                    { header }
                </div>
                <div className="scheduler-event-body">
                    { label }
                </div>
                <div aria-label="resize event"  
                     className = { "react-ui-scheduler-resize-event " + getResizeHandlerClasses() }
                     onMouseDown = { e => handleMouseDown(e, 'resizing') }
                     style = {{ position: 'absolute', width: '100%', height: '10px', bottom: 0 }}
                >
                </div>
            </div>
        </div>
    )
    
}

// @todo need a function for this ?
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString().substring(0, 5);
}

export default DailyColumnsEvent
    