global.ResizeObserver = function(fn) {
    
    this.observe = (element) => {
        element.addEventListener('resize', fn);
    }
    
    this.unobserve = (element) => {
        element.removeEventListener('resize', fn);
    }
}