export default class SPSplitterElement extends HTMLElement {
    static get observedAttributes() {
        return [];
    }
    connectedCallback() {
        this.addEventListener('mousedown', (event) => {
            this.parentNode.activeSplitter = this;
        });
        this.addEventListener('mouseup', (event) => {
            this.parentNode.activeSplitter = null;
        });
    }
}