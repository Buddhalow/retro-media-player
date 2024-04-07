import SPViewElement from '/js/controls/view.js';
import store from '/js/plugins/media/store.js';

export default class SPPublisherViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.created3) {
            this.created = true;
            this.state = {
                artist: null,
                albums: []
            }
            this.header = document.createElement('sp-header');
            this.appendChild(this.header);
            this.classList.add('sp-view');
            this.state = {};
            this.container = document.createElement('div')
            this.container.classList.add('container')
            this.appendChild(this.container)

            this.managerDivider = document.createElement('sp-divider');
            this.managerDivider.innerHTML = _('Manages');
            this.managerDivider.style.display = 'none';
            this.manager = document.createElement('sp-manager');
            this.manager.style.display = 'none';
            this.container.appendChild(this.managerDivider);
            this.container.appendChild(this.manager);
            if (!this.albumsDivider) {
                this.albumsDivider = document.createElement('sp-divider');
                this.albumsDivider.innerHTML = _('Public shows');
                this.container.appendChild(this.albumsDivider);
            }
            this.flow = JSON.parse(localStorage.getItem('theme')).stylesheet === 'maestro';
            if (this.flow) {

                this.releaseFlow = document.createElement('sp-flow');
                this.container.appendChild(this.releaseFlow);
            } else {
                if (!this.albumList) {
                    this.albumList = document.createElement('sp-showcontext');
                    this.albumList.setAttribute('data-max-rows', 10);
                    this.albumList.setAttribute('fields', 'name,duration,artists,added_at,added_by');
                    this.appendChild(this.albumList);
                }
            }
            this.created3 = true;
        }
    }
    acceptsUri(uri) {
        return new RegExp(/^spotify:publisher:(.*)$/).test(uri);
    }
    navigate(uri) {

    }
    activate() {
        super.activate();
        GlobalTabBar.setState({
            object: this.state,
            objects: [{
                id: 'overview',
                name: 'Overview'
            }]
        });
    }
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {
            this.state = await store.request('GET', newVal);
            if (this.flow) {
                this.releaseFlow.setAttribute('uri', newVal + ':show')
            } else {
                this.albumList.setAttribute('uri', newVal + ':show');
            }
            this.setState(this.state);
        }
    }
    setState(state) {
        this.state = state;
        this.header.setState({object: state});
        this.render();
    }
    render() {
        this.activate();
    }
}
