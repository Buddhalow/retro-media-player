class SPPopoverElement extends HTMLElement {
    connectedCallback() {
        if (!this.created) {
            this.created = new Date();
            this.style.display = 'flex';
            let viewStack = document.createElement('sp-viewstack');t
            viewStack.style.flex = '1';
            this.appendChild(viewStack);
            viewStack.navigate(this.getAttribute('uri'));
            this.created = true;
        }
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'anchor') {

        }
    }
}
