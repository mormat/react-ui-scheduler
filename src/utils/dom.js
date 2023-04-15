/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const getHtmlTableInfos = (parent) => {
    
    const tbody   = parent.querySelector('tbody');
    const headers = [...parent.querySelectorAll('thead th')];
    
    const { left, top }   = parent.getBoundingClientRect();
    
    const offset  = { left, top  };
    
    const columns = headers.map(elt => {
        const { left, width } = elt.getBoundingClientRect();
        const { top, height } = tbody.getBoundingClientRect();
        
        return { left, top, width, height }
    });
    
    return {offset, columns }
}

export default { getHtmlTableInfos } 