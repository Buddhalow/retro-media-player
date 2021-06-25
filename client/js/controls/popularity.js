
    function rgbToRgba(rgb, alpha) {
        let str = 'rgba';
        let tf = rgb.split('(')[1].split(')')[0].split(',');
        str += '(' + tf + ',' + alpha + ')';
        return str;
    
    }
    /**
     * Popularity bar
     */
    export default class SPPopularityBarElement extends HTMLElement {
        connectedCallback() {
            this.canvas = document.createElement('canvas');
            this.appendChild(this.canvas);
            this.node = this.canvas;
            this.BAR_WIDTH = 2 * 4;
            this.BAR_HEIGHT = 2 * 109;
            this.SPACE = 8;
            this.popularity = 0.0;
            this.height = 7;
            this.width = 3;
            this.style.pointerEvents = 'none';
            this.style.position = 'relative';
            this.node.style.width = '60pt';
            this.node.style.height = '7pt';
            this.style.padding = '0pt';
            this.attributeChangedCallback('value', 0, !isNaN(this.getAttribute('value')) || 0);
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'value') {
                this.setState(newVal);
            }
        }
        setState(value) {
            debugger;
            value = value / 100
            this.style.backgroundColor = 'transparent';
            var ctx = this.node.getContext('2d');
            // draw dark bars
            ctx.fillStyle = this.style.backgroundColor;
            ctx.fillRect(0, 0, this.node.width, this.node.height);
            let fillStyle = rgbToRgba(window.getComputedStyle(this).getPropertyValue('color') || "rgb(255, 255, 255)", 0.2);
            ctx.fillStyle = fillStyle;
            var totalPigs = 0
            for (var i = 0; i < this.node.width; i+= this.BAR_WIDTH + this.SPACE) {
                ctx.fillRect(i, 0, this.BAR_WIDTH, this.BAR_HEIGHT);
                totalPigs++;
            }
            ctx.fillStyle = rgbToRgba(window.getComputedStyle(this).getPropertyValue('color') || "rgb(255, 255, 255)", 0.6);
            var lightPigs = value * totalPigs;
            var left = 0;
            for (var i = 0; i < lightPigs -1; i++) {
                ctx.fillRect(left, 0, this.BAR_WIDTH, this.BAR_HEIGHT);
                left += this.BAR_WIDTH + this.SPACE;
            }
        }

    }
