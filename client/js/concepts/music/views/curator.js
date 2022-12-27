import SPViewElement from '/js/controls/view.js';
import store from '/js/concepts/music/store.js';
export default class SPCuratorViewElement extends SPViewElement {
    connectedCallback() {
        super.connectedCallback();
        this.classList.add('sp-view');
        this.header = document.createElement('sp-header');
        this.appendChild(this.header);
    
    }
    activate() {
        this.header.tabBar.setState({
            object: this.state,
            objects: [
                {
                    id: 'overview',
                    name: 'Overview'
                },
                {
                    id: 'playlists',
                    name: 'Playlists'
                }
            ]
        })
    }
    // T
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName == 'uri') {
            
            let result = store.request('GET', newVal);
            this.state = result;
            this.header.setAttribute('uri', newVal);
            this.activate();
        }
    }
    
}