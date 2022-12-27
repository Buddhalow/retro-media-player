import SPViewElement from '/js/concepts/music/views/view.js';
import store from '/js/concepts/music/store.js';

export default class SPCountryViewElement extends SPViewElement {
    connectedCallback() {

        super.connectedCallback();
        if (!this.created3) {
            this.classList.add('sp-view');
            this.header = document.createElement('sp-header');
            this.appendChild(this.header);
            this.albumsDivider = document.createElement('sp-divider');
            this.albumsDivider.innerHTML = 'Top Tracks';
            this.topTracks = document.createElement('sp-playlist');
            this.topTracks.setAttribute('limit', '5')
            this.created = true;
            this.container = document.createElement('div')
            this.container.classList.add('container')
            this.appendChild(this.container)
            this.container.appendChild(this.albumsDivider);
            this.container.appendChild(this.topTracks);
            this.created3 = true;
        }

    }
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {

            let result = await store.request('GET', newVal);

            this.setState({
                object: result
            });
            this.topTracks.setAttribute('uri', newVal + ':top:5');
            this.tab
            this.activate();
        }
    }
    setState(state) {
        this.header.setState(state);
    }
    activate() {
        super.activate();
        GlobalTabBar.setState({
            objects: [{
                id: 'overview',
                name: _e('Overview')
            }]
        })
    }
}
