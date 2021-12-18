import SPViewElement from '/js/controls/view.js';
import store from '/js/plugins/spotify/store.js';

export default class SPPlayqueueViewElement extends SPViewElement {
    connectedCallback() {
        super.connectedCallback();
        this.classList.add('sp-view');
        if (!this.header) {
            this.header = document.createElement('sp-header');
            this.appendChild(this.header);
        }
        if (!this.trackcontext) {
            this.trackcontext = document.createElement('sp-trackcontext');
            this.appendChild(this.trackcontext);
        }

    }
    acceptsUri(uri) {
        return /^bungalow:internal:playqeueue$/.test(uri);
    }
    navigate() {

    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {
            this.trackcontext.setAttribute('uri', newVal + ':track');

            if (newVal in store.state) {
                this.header.setState(store.state[newVal]);
                return;
            }
            let result = store.request('GET', newVal);
            this.header.setState(result);
        }
    }
}