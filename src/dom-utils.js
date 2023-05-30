
function getColumnsLayout(element) {

    const tbody   = element.querySelector('tbody');
    const headers = [...element.querySelectorAll('thead th')];

    const rect = element.getBoundingClientRect();
    
    const children = headers.map(elt => {
        
        let [left, top, width, height] = [0, 0, 0, 0];

        ({ left, width } = elt.getBoundingClientRect());
        if (tbody) {
            ({ top, height } = tbody.getBoundingClientRect());
        }
        
        left -= rect.left;
        top  -= rect.top;

        return { left, top, width, height }
       
    });
    
    const { left, top, width, height } = rect;

    return { left, top, width, height, children }

}

function startDrag(dragHandler, subject, e, notify = _noop) {
    
    dragHandler.press(subject, e);
    notify('press', subject, e);
    
    const mousemove  = (e) => {
        dragHandler.move(subject, e);
        notify('move', subject, e);
    }
    
    const mouseup = (e) => {
        dragHandler.release(subject, e);    
        notify('release', subject, e);
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup',   mouseup);
    }
    
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
}

const _noop = () => {}

export { getColumnsLayout, startDrag } 