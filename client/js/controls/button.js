
    export default class SPButtonElement extends HTMLElement {
        connectedCallback() {
            this.setAttribute('class', 'btn waves-effect waves-light lighten-3 ' + this.getAttribute('class'));
        }
    }
