import SPViewElement from '/js/plugins/spotify/views/view.js';
import store from '/js/plugins/spotify/store.js';

export default class SPArtistViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.created3) {
            this.state = {
                artist: null,
                albums: []
            }
            this.classList.add('sp-view');
            this.content = document.createElement('div');
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
            this.overviewTab.appendChild(this.overviewTab.topTracksDivider);
            this.overviewTab.toplist = document.createElement('sp-playlist');
            this.overviewTab.appendChild(this.overviewTab.toplist);
            this.aboutTab = document.createElement('sp-tabcontent');
            this.aboutTab.aboutElement = document.createElement('sp-spotifyaboutartist');
            this.aboutTab.appendChild(this.aboutTab.aboutElement);
            this.aboutTab.setAttribute('data-tab-id', 'about');
            this.container.appendChild(this.aboutTab);
            this.aboutPage = document.createElement('sp-about')
            this.appendChild(this.container)
            this.created3 = true
        }
    }
    createReleaseSection(name, uri, release_type) {

        let singlesDivider = document.createElement('sp-divider');
        singlesDivider.innerHTML = name;
        singlesDivider.style.display = 'block';
        this.overviewTab.appendChild(singlesDivider);
        let theme = JSON.parse(localStorage.getItem('theme'))
        let flow = theme ? theme.stylesheet === 'maestro' : false;
        if (flow) {
            let releaseFlow = document.createElement('sp-flow');
            this.overviewTab.appendChild(releaseFlow);
            releaseFlow.setAttribute('uri', uri + ':' + release_type);
        } else {
            let releaseList = document.createElement('sp-playlistcontext');
            releaseList.setAttribute('fields', 'p,name,duration,popularity,artists');
            releaseList.setAttribute('data-context-artist-uri', uri);
            releaseList.setAttribute('uri', uri + ':' + release_type);
            releaseList.setAttribute('data-max-rows', '5');
            releaseList.view = this;
            this.overviewTab.appendChild(releaseList)
        }
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
                    id: 'about',
                    name: _('about')
                })
            }
            GlobalTabBar.setState({
                object: this.state,
                objects: tabs
            });
            setTimeout(() => this.header.scroll(),
            100)
            this.setState({object:this.state});

    }
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {
            newVal = 'spotify:' + newVal.split(':').splice(1).join(':');
            this.overviewTab.toplist.setAttribute('data-context-artist-uri', newVal);
            this.overviewTab.toplist.columnheaders=['p','name','popularity','duration','artists'];

            if (false && newVal in store.state) {
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
                        id: 'related_artist',
                        name: _('Related artists')
                    },
                    {
                        id: 'about',
                        name: _('about')
                    }
                ]
            })
            this.overviewTab.toplist.setAttribute('uri', newVal + ':top:5');
            this.state = result;

            this.createReleaseSection(_('Releases'), newVal, 'release');


            this.aboutTab.aboutElement.setState({object: result})

                super.afterLoad();
            this.setState(this.state);
            this.activate();

        }
    }
    setState(state) {
        this.header.setState({object:this.state});
    }
}

