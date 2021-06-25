export default class SPExpanderElement extends HTMLElement {
    connectedCallback() {
    
        this.classList.add('fa');
        this.classList.add('fa-arrow-circle-down');
        this.addEventListener('click', this._onClick.bind(this));
        this.style.cssFloat = 'right';
    }
    _onClick(e) {
        e.target.parentNode.open = !e.target.parentNode.open;
        if (e.target.parentNode.open) {
            this.classList.remove('fa-arrow-circle-down');
            this.classList.add('fa-arrow-circle-up');
        } else {
            this.classList.remove('fa-arrow-circle-up');
            this.classList.add('fa-arrow-circle-down');
            
        }
    }
}