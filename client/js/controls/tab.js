import {getParentElementByTagName} from '/js/util/dom.js';
export default class SPTabElement extends HTMLElement {
    connectedCallback() {
        this.addEventListener('mousedown', this.onClick);
    }

    onClick(event) {
        let elm = event.target;
        if (!(elm instanceof SPTabElement)) {
            elm = getParentElementByTagName(elm, 'SP-TAB');
        }
        let tabId = elm.getAttribute('data-tab-id');
        let evt = new CustomEvent('tabselected');
        evt.data = tabId;
        this.dispatchEvent(evt);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
    }
}
