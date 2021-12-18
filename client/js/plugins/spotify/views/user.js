import SPViewElement from '/js/controls/view.js';
import store from '/js/plugins/spotify/store.js';

export default class SPUserViewElement extends SPViewElement {
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
                this.albumsDivider.innerHTML = _('Public playlists');
                this.container.appendChild(this.albumsDivider);
            }
            this.flow = JSON.parse(localStorage.getItem('theme')).stylesheet === 'maestro';
            if (this.flow) {

                this.releaseFlow = document.createElement('sp-flow');
                this.container.appendChild(this.releaseFlow);
            } else {
                if (!this.albumList) {
                    this.albumList = document.createElement('sp-playlistcontext');
                    this.albumList.setAttribute('data-max-rows', 10);
                    this.albumList.setAttribute('fields', 'name,duration,artists,added_at,added_by');
                    this.appendChild(this.albumList);
                }
            }
            this.created3 = true;
        }
    }
    acceptsUri(uri) {
        return new RegExp(/^spotify:user:(.*)$/).test(uri);
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
                this.releaseFlow.setAttribute('uri', newVal + ':playlist')
            } else {
                this.albumList.setAttribute('uri', newVal + ':playlist');
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
            if (this.state.manages.length > 0) {
            this.manager.style.display = 'block';
            this.managerDivider.style.display = 'block';
                this.state.manages.map((obj) => {
                    let a = document.createElement('sp-link');
                    a.style.display = 'inline-block';
                    a.style.textAlign = 'center';
                    a.setAttribute('uri', obj.uri);
                    let image = document.createElement('sp-image');
                image.setState(obj);
                image.style.display = 'inline-block';
                a.appendChild(image);
                a.innerHTML += '<br><span>' + obj.name + '</span>';
                    this.manager.appendChild(a);
                })
            }
            this.activate();
    }
}
