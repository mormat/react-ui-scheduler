import { createRef, useEffect, useState, Fragment } from 'react';

// @todo 'draggable' is lame. use 'dragHandler != null' instead
function DailyColumnsEvent( { value, columnsLayout, dragHandler, draggable, options = {} } ) {
        
    const [rect,   setRect]   = useState(null);
    const [header, setHeader] = useState('');
    const [range,  setRange]  = useState({start: value.start, end: value.end});
    const [draggingState, setDraggingState] = useState(''); // @todo rename to dragInfos ?
    
    const { events = [] } = options;
    
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
                
                rect = {
                    left: columnRect.left - parentRect.left,
                    top: (start - min) * ratio + columnRect.top - parentRect.top,
                    width: columnRect.width,
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
            classes.push('react-ui-scheduler-event-draggable');
        }
        if (['press', 'move'].includes(draggingState)) {
            classes.push('react-ui-scheduler-event-moving');
            /* if (isOverlapping()) {
                classes.push('react-ui-scheduler-event-dragging-forbidden');
            } */
        }
        
        return classes.join(' ');
    }
    
    const getResizeHandlerClasses = () => {
        let classes = [];
        if (draggable) {
            classes.push('react-ui-scheduler-event-resizable');
        }
        if (['press', 'move'].includes(draggingState)) {
            classes.push('react-ui-scheduler-event-resizing');
            /* if (isOverlapping()) {
                classes.push('react-ui-scheduler-event-resizing-forbidden');
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
        const { onEventChange } = options;
        
        if (draggingState === 'release' && onEventChange) {
            onEventChange(value)    
        }
        
    }, [draggingState]);
    
    
    const { label, backgroundColor = "white", color } = value;
    
    if (rect === null) {
        return (<div/>);        
    }
    
    return (
        <Fragment>
            <div className  = { "react-ui-scheduler-event " + getMainClasses() }
                 onMouseDown = { e => handleMouseDown(e, 'moving') }
                 style       = { { ...rect, backgroundColor, color, position: "absolute" } }
            >
                <div className="react-ui-scheduler-eventHeader">
                    { header }
                </div>
                <div className="react-ui-scheduler-eventBody">
                    { label }
                </div>
                <div aria-label="resize event"  
                     className = { "react-ui-scheduler-resize-event " + getResizeHandlerClasses() }
                     onMouseDown = { e => handleMouseDown(e, 'resizing') }
                     style = {{ position: 'absolute', width: '100%', height: '10px', bottom: 0 }}
                >
                </div>
            </div>
        </Fragment>
    )
    
}

// @todo need a function for this ?
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString().substring(0, 5);
}

export default DailyColumnsEvent
    