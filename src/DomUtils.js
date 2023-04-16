
const getHtmlTableColumnsInfos = (parent) => {
    
    const tbody   = parent.querySelector('tbody');
    const headers = [...parent.querySelectorAll('thead th')];
    
    const parentRect = parent.getBoundingClientRect();
    const offsetX = parentRect.x;
    const offsetY = parentRect.y;
    
    return headers.map(elt => {
        
        const { x, width } = elt.getBoundingClientRect();
        const { y, height } = tbody.getBoundingClientRect();
        
        return { x, y, width, height, offsetX, offsetY }
    });
    
}

export default { getHtmlTableColumnsInfos } 