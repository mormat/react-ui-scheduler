
import { createRef, useEffect, useState } from 'react';

function SchedulerEvent( { value = {}, columns = [] }) {
    
    const [start,  setStart]  = useState(value.start);
    const [end,    setEnd]    = useState(value.end);
    const [left,   setLeft]   = useState(0);
    const [top,    setTop]    = useState(0);
    const [width,  setWidth]  = useState(0);
    const [height, setHeight] = useState(0);
    
    useEffect(() => {

        for (let { x, y, width, height, offsetX, offsetY, data } of columns) {

            if (data['min'] <= start && start <= data['max']) {

                const ratio  = height / (data['max'] - data['min']);
                
                setLeft(x - offsetX);
                setWidth(width);
                setHeight((end   - start) * ratio);
                setTop((start - data['min']) * ratio + y - offsetY);
                
            }

        }
        
    }, [start, end, columns]);
    
    const handleMouseDown = (e, action) => {
        
        e.preventDefault();
        e.stopPropagation();
        
        const actions = {
            'move':   moveSchedulerEvent,
            'resize': resizeSchedulerEvent
        }
        
        if (action in actions) {
            const step = 15 * 60 * 1000;
            
            const mousemove = actions[action](e, step);
            
            // how to test event removal ?
            const mouseup = (e) => {
                window.removeEventListener('mousemove', mousemove);
                window.removeEventListener('mouseup',   mouseup);
            }

            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup',   mouseup);
        }
        
    }
    
    const moveSchedulerEvent = (e, step) => {

        const length = end - start;

        let diff = start - calcValueFromColumnPosition(e, findNearestColumn(e, columns)) ;

        return (e) => {

            const column = findNearestColumn(e, columns);

            const currentValue = calcValueFromColumnPosition(e, column);
            const minValue     = column.data.min;
            const maxValue     = column.data.max;

            let start = diff + currentValue;

            start = Math.max(start, minValue);
            start = Math.min(start, maxValue - length);
            start = Math.floor(start / step) * step;
            
            setStart(start);
            setEnd(start + length);

        };

    }

    const resizeSchedulerEvent = (e, step) => {

        const startColumn = findNearestColumn(e, columns);
        const maxValue    = startColumn.data.max;
        const diff = end - calcValueFromColumnPosition(e, startColumn) ;

        return (e) => {

            let currentValue = calcValueFromColumnPosition(e, startColumn);

            let end = diff + currentValue;

            end = Math.max(end, start + step);
            end = Math.min(end, maxValue);
            end = Math.floor(end / step) * step;

            setEnd(end);

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

const findNearestColumn = ( {clientX, clientY}, columns) => {
    
    const distances = [];
    const indexed   = {};
    
    for (let column of columns) {
        
        const { x, y, width, height }  = column;
        
        if (x <= clientX && clientX <= (x + width) &&
            y  <= clientY && clientY <= (y  + height)
        ) {
            return column;
        }
        
        const center   = [x + width / 2, y + height / 2];
        const distance = Math.sqrt(
            Math.pow(center[0] - clientX, 2),
            Math.pow(center[1] - clientY, 2),
        );
        indexed[distance] = column;
        distances.push(distance);
    }
    
    return indexed[Math.min(...distances)];
    
}

const calcValueFromColumnPosition = ( {clientY} , column) => {
    
    const { y, height, data } = column;
    
    let minValue = data.min;
    let maxValue = data.max;
    
    let percentY = (clientY - y) / height;
    
    let timestamp = (maxValue - minValue) * percentY + minValue;
    timestamp = Math.max(timestamp, minValue);
    timestamp = Math.min(timestamp, maxValue);
        
    return timestamp;
}

    
export default SchedulerEvent