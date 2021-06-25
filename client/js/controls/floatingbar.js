
    export default class SPFloatingBarElement extends HTMLElement {
        connectedCallback() {
            this.innerHTML = '<sp-searchform></sp-searchform>';
        }
    }
