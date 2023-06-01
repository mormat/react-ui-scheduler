import { expect } from '@jest/globals';

global.DOMRect = class DOMRect {
    bottom:number=0;
    left:number=0;
    right:number=0;
    top:number=0;
    constructor (public x=0, public y=0, public width=0, public height=0) {
        this.left = x;
        this.top  = y;
        this.right  = x + width;
        this.bottom = y + height;
    };
    static fromRect(other: DOMRectInit): DOMRect {
        return new DOMRect(other.x,other.y,other.width,other.height)
    }
    toJSON() {
        return JSON.stringify(this)
    }
}
