const handleMouseDownItem = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startColumn  = getNearestColumn(e, columns);
        const currentValue = getTrucmucheColumn(e, startColumn);
        
        dragged = {
            columns,
            delta: start - currentValue,
            item: {start, end, type: 'item'},
            setters: {setStart, setEnd}
        }
    }
    
    const handleMouseDownHandle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startColumn  = getNearestColumn(e, columns);
        const currentValue = getTrucmucheColumn(e, startColumn);
        
        dragged = {
            startColumn,
            columns,
            delta: end - currentValue,
            item: {start, end, type: 'handle'},
            setters: {setStart, setEnd}
        }
    }

const getNearestColumn = (e, columns) => {
    
    const distances = [];
    const indexed   = {};
    
    for (let column of columns) {
        
        const { rect }  = column;
        
        if (rect.left <= e.clientX && e.clientX <= (rect.left + rect.width) &&
            rect.top  <= e.clientY && e.clientY <= (rect.top  + rect.height)
        ) {
            return column;
        }
        
        const center   = [rect.left + rect.width / 2, rect.top + rect.height / 2];
        const distance = Math.sqrt(
            Math.pow(center[0] - e.clientX, 2),
            Math.pow(center[1] - e.clientY, 2),
        );
        indexed[distance] = column;
        distances.push(distance);
    }
    
    return indexed[Math.min(...distances)];
    
}

const getTrucmucheColumn = (e, column) => {
    
    const { rect, data } = column;
    
    let minValue = Number(data['prout-min']);
    let maxValue = Number(data['prout-max']);
    
    let percentY = (e.clientY - rect.top) / rect.height;
    // percentY = Math.min(percentY, maxValue);
    
    let timestamp = (maxValue - minValue) * percentY + minValue;
    timestamp = Math.max(timestamp, minValue);
    timestamp = Math.min(timestamp, maxValue);
    return timestamp;
}


export {
    Machin, getNearestColumn, getTrucmucheColumn
}

window.addEventListener('mousemove', (e) => {
    if (!dragged) {
        return;
    }
    
    const { item, columns, delta } = dragged;
    const { setStart, setEnd }     = dragged.setters;
        
    const step         = 60 * 15 * 1000;
        
    if (item.type === 'item') {
    
        const column = getNearestColumn(e, columns);
        
        const currentValue = getTrucmucheColumn(e, column);
        const minValue     = Number(column.data['prout-min']);
        const maxValue     = Number(column.data['prout-max']);
        
        const length = item.end - item.start;

        let start = delta + currentValue;

        if (start < minValue) {
            start = minValue;
        }

        if (start > maxValue - length) {
            start = maxValue - length;
        }

        

        item.start = Math.floor(start / step) * step;
        item.end   = item.start + length;

        setStart(item.start);
        setEnd(item.end);
    }
    
    if (item.type === 'handle') {
        
        console.log('moving handle');
        
        const { startColumn } = dragged;
        
        console.log(delta);
        
        const maxValue     = Number(startColumn.data['prout-max']);
        
        let currentValue = delta + getTrucmucheColumn(e, startColumn);
        
        currentValue = Math.max(currentValue, item.start + step);
        currentValue = Math.min(currentValue, maxValue);
        
        item.end = Math.floor(currentValue / step) * step;

        setEnd(item.end);
    }
    
});

window.addEventListener('mouseup', function() {
   dragged = null;
});
