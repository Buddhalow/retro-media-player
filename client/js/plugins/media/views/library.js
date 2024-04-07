import SPViewElement from '/js/controls/view.js';
import store from '/js/plugins/media/store.js';

export default class SPArtistViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.created2) {
            this.state = {
                artist: null,
                albums: []
            }
            this.innerHTML = '<div class="bg-mask"></div>';
            this.header = document.createElement('sp-header');
            this.appendChild(this.header);
            this.container = document.createElement('div')
            this.container.classList.add('container')
            this.classList.add('sp-view');

            this.overviewTab = document.createElement('sp-tabcontent');
            this.overviewTab.setAttribute('data-tab-id', 'overview');
            this.container.appendChild(this.overviewTab);
            this.overviewTab.topTracksDivider = document.createElement('sp-divider');
            this.overviewTab.topTracksDivider.innerHTML = _e('Top Tracks');
            this.created2 = true


            let playlistsFlow = document.createElement('sp-flow');
            this.overviewTab.appendChild(releaseFlow);
            playlistsFlow.setAttribute('uri', uri + ':playlist');
        }
    }
    createReleaseSection(name, uri, release_type) {

    }
    acceptsUri(uri) {
        return new RegExp(/^bungalow:artist:(.*)$/).test(uri);
    }
    navigate(uri) {

    }
    activate() {
            super.activate();
            let tabs = [
                {
                    id: 'overview',
                    name: _('overview')
                }
            ]
            if (this.state.insights) {
                tabs.push({
                    id: 'playlists',
                    name: _('playlists')
                })
            }
            this.header.tabBar.setState({
                object: this.state,
                objects: tabs
            });
            setTimeout(() => this.header.scroll(),
            100)

    }
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {
            newVal = 'spotify:' + newVal.split(':').splice(1).join(':');
            this.overviewTab.toplist.setAttribute('data-context-artist-uri', newVal);
            this.overviewTab.toplist.columnheaders=['p','name','popularity','duration','artists'];

            if (newVal in store.state) {
                this.setState(store.state[newVal]);
                return;
            }

            var result = await store.request('GET', newVal);
            var about = null
            try {
                about = await store.request('GET', newVal + ':about')

            } catch (e) {

            }
            if (about && about.insights)
                result = about
            this.state = result
            try {
                result.description = result.insights.autobiography.body
            } catch (e) {

            }
            this.header.state = {
                object: result
            };
            GlobalTabBar.setState({
                object: this.state,
                objects: [
                    {
                        id: 'overview',
                        name: _('overview')
                    },
                    {
                        id: 'playlists',
                        name: _('playlists')
                    }
                ]
            })
            this.overviewTab.toplist.setAttribute('uri', newVal + ':top:5');
            this.state = result;

            this.createReleaseSection(_('Singles'), newVal, 'single');
            this.createReleaseSection(_('Albums'), newVal, 'album');


            this.aboutTab.aboutElement.setState({object: result})

                super.afterLoad();
            this.setState(this.state);
            this.activate();

        }
    }
    setState(state) {
        this.header.setState(state);
    }
}

