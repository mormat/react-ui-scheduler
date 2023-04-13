
const findNearestColumn = ( {clientX, clientY}, columns) => {
    
    const distances = [];
    const indexed   = {};
    
    for (let column of columns) {
        
        const { rect }  = column;
        
        if (rect.left <= clientX && clientX <= (rect.left + rect.width) &&
            rect.top  <= clientY && clientY <= (rect.top  + rect.height)
        ) {
            return column;
        }
        
        const center   = [rect.left + rect.width / 2, rect.top + rect.height / 2];
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
    
    const { rect, data } = column;
    
    let minValue = data.min;
    let maxValue = data.max;
    
    let percentY = (clientY - rect.top) / rect.height;
    
    let timestamp = (maxValue - minValue) * percentY + minValue;
    timestamp = Math.max(timestamp, minValue);
    timestamp = Math.min(timestamp, maxValue);
        
    return timestamp;
}

const dragMoveHandle = (e, {start, end, setStart, setEnd, columns, step = 1}) => {
    
    const length = end - start;
    
    let diff = start - calcValueFromColumnPosition(e, findNearestColumn(e, columns)) ;
    
    const mousemove = (e) => {
        
        const column = findNearestColumn(e, columns);
        
        const currentValue = calcValueFromColumnPosition(e, column);
        const minValue     = column.data.min;
        const maxValue     = column.data.max;
        
        start = diff + currentValue;

        if (start < minValue) {
            start = minValue;
        }

        if (start > maxValue - length) {
            start = maxValue - length;
        }
        start = Math.floor(start / step) * step
        end   = start + length;

        setStart(start);
        setEnd(end);
        
    };
    
    // how to test event removal ?
    const mouseup = (e) => {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup',   mouseup);
    }
    
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup',   mouseup);
    
}

const dragResizeHandle = (e, {start, end, setEnd, columns, step = 1}) => {
    
    const startColumn = findNearestColumn(e, columns);
    const maxValue    = startColumn.data.max;
    const diff = end - calcValueFromColumnPosition(e, startColumn) ;

    const mousemove = (e) => {
    
        let currentValue = calcValueFromColumnPosition(e, startColumn);
        
        let end = diff + currentValue;
        
        end = Math.max(end, start + step);
        end = Math.min(end, maxValue);
        
        end = Math.floor(end / step) * step;
        
        setEnd(end);
        
    }
    
    const mouseup = (e) => {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup',   mouseup);
    }
    
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup',   mouseup);
    
}


export default { dragMoveHandle, dragResizeHandle }
