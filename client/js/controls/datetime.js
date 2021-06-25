export default class SPDateTimeElement extends HTMLElement {
    tick() {
        this.render();
    }
    format(time) {
        time = moment(time);
        let now = new Date().getTime();
        let then = time.toDate().getTime();
        let str = '';
        if ((new Date().getTime() - time.toDate().getTime()) > 1000 * 60 * 60 * 24 * 16) {
            str = time.format('YYYY-MM-DD').slice(0, 10) 
            this.classList.add('old');
        } else {
            str = time.fromNow();
        }
        if (str.length > 15) {
            // str = str.slice(0, 15) + '...';
        }
        return str;
    }
    shadow() {
        if (this.hasAttribute('shadow')) {
            if ((new Date().getTime() - this.state.getTime()) > 1000 * 60 * 60 * 24 * 16) {
                
                this.classList.add('old');
            }
            var relative = new Date().getTime() - this.state.getTime();
            
            if (relative < 1123200 * 1000) {
                //this.style.opacity = 1 - (((relative / (1123200 * 1000))) / 100);
            } else {
                this.classList.add('old');
            }
            this.style.pointerEvents = 'none';
        
        } else {
            this.style.opacity = .8;
        }
    }
    
    connectedCallback() {
        setInterval(this.tick.bind(this), 60000);
    }
    setState(state) {
        this.state = state;
        this.render();
    }
    render() {
        this.innerHTML = this.format(this.state);
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        
    }
}