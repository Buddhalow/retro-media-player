import SPViewElement from '/js/controls/view.js';
import store from '/js/concepts/music/store.js';

export default class SPAlbumViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.created2) {
            this.classList.add('sp-view');
            this.innerHTML = '<div class="bg-mask"></div>';
            let theme = JSON.parse(localStorage.getItem('theme')) || {stylesheet: ''}
            this.modern = theme.stylesheet === 'maestro'
            if (!this.modern) {
                this.innerHTML = '<sp-playlist fields="p,name,duration,artists"></sp-playlist>';
                this.created2 = true;
                return
            }
            this.header = document.createElement('sp-header');
            this.header.view = this;
            this.appendChild(this.header);
            this.container = document.createElement('div')
            this.container.classList.add('container')
            this.appendChild(this.container)
            this.albumTab = document.createElement('sp-tabcontent');
            this.container.appendChild(this.albumTab);

            this.albumTab.setAttribute('label', _e('Overview'));
            this.albumTab.setAttribute('data-tab-id', 'overview');

            this.albumTab.albumView = document.createElement('sp-trackcontext');
            this.albumTab.albumView.setAttribute('fields', 'p,name,duration,artists');
            this.albumTab.appendChild(this.albumTab.albumView);
            this.albumTab.albumView.showCopyrights = true;
            this.albumTab.albumView.view = this;
            this.albumTab.contentHook = document.createElement('sp-hook');
            this.albumTab.contentHook.setAttribute('data-hook-id', 'albumview');
            this.albumTab.appendChild(this.albumTab.contentHook);
            this.created2 = true;
        }
    }
    acceptsUri(uri) {
        return /^bungalow:album:(.*)$/.test(uri);
    }
    navigate() {

    }
    activate() {
        super.activate();
        this.render();
    }
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri' && newVal !== oldVal) {
            newVal = 'music:' + newVal.split(':').splice(1).join(':');
            this.state = {
                object : await store.request('GET', newVal)
            };
            if (!this.modern) {
                this.querySelector('sp-playlist').setAttribute('uri', newVal)

                this.render();
                return;
            }
            this.header.setAttribute('uri', newVal);
            this.albumTab.albumView.setAttribute('uri', newVal + ':track');


        }
    }
    setState(state) {
        this.state = state;
        this.render();
    }
    render() {
        if (this.header)
            this.header.setState(this.state.object);
        GlobalTabBar.setState({
            object: this.state ? this.state.object : null,
            objects: [
                {
                    id: 'overview',
                    name: _('album')
                }
            ]
        })
    }
}
