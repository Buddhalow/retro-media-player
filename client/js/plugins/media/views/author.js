import SPViewElement from '/js/controls/view.js';
import store from '/js/plugins/media/store.js';

export default class SPAuthorViewElement extends SPViewElement {
    connectedCallback() {
        super.connectedCallback();
        
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
        this.overviewTab.innerHTML = '<sp-divider>' + _('published-books') + '</sp-divider>'
        this.container.appendChild(this.overviewTab);
        this.overviewTab.toplist = document.createElement('sp-playlist');
        
        this.aboutTab = document.createElement('sp-tabcontent');
        this.aboutTab.aboutElement = document.createElement('sp-spotifyaboutartist');
        this.aboutTab.appendChild(this.aboutTab.aboutElement);
        this.aboutTab.setAttribute('data-tab-id', 'about');
        this.container.appendChild(this.aboutTab);
        this.playlistsTab = document.createElement('sp-tabcontent');
        this.playlistsTab.setAttribute('data-tab-id', 'playlists');
        this.container.appendChild(this.playlistsTab);
        this.playlistsTab.playlistsList = document.createElement('sp-playlistlist');
        this.playlistsTab.appendChild(this.playlistsTab.playlistsList);
        
        this.playlistsTab.playlistsList.view = this;
        this.playlistsTab.playlistsList.header = this.header;
        this.aboutPage = document.createElement('sp-about')
        this.appendChild(this.container)
    }
    createReleaseSection(name, uri, release_type) {
        
        let flow = JSON.parse(localStorage.getItem('theme')).stylesheet == 'maestro';
        if (flow) {
            let releaseFlow = document.createElement('sp-flow');
            releaseFlow.setAttribute('tower', 'true')
            this.overviewTab.appendChild(releaseFlow);
            releaseFlow.setAttribute('uri', uri + ':' + release_type);
        } else {
            let releaseList = document.createElement('sp-audiobookcontext');
            releaseList.setAttribute('fields', 'p,name,duration,popularity,artists');
            releaseList.setAttribute('data-context-artist-uri', uri);
            releaseList.setAttribute('uri', uri + ':' + release_type);
            releaseList.setAttribute('data-max-rows', '5');
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
                    name: _('audiobooks')
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
            })
            this.header.tabBar.setState({
                object: this.state,
                objects: [
                    {
                        id: 'overview',
                        name: _('audiobooks')
                    },
                    {
                        id: 'about',
                        name: _('about')
                    },
                    {
                        id: 'playlists',
                        name: _e('Playlists (Powered by Google)')
                    }
                ]
            });
    
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName == 'uri') {
            newVal = 'spotify:author:' + newVal.split(':')[2];  
            this.overviewTab.toplist.setAttribute('data-context-artist-uri', newVal);
            this.overviewTab.toplist.columnheaders=['p','name','popularity','duration','artists'];
            
            if (newVal in store.state) {
                this.setState(store.state[newVal]);
                return;
            }
            
            var result = store.request('GET', newVal);
            var about = null
            try {
                about = store.request('GET', newVal + ':about')
                
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
                        name: _('Books')
                    }
                ]
            })
            this.overviewTab.toplist.setAttribute('uri', newVal + ':top:5');
            this.state = result;
            
            this.createReleaseSection(_('Audiobooks'), newVal, 'audiobook');
            
            
            this.aboutTab.aboutElement.setState({object: result})
            
            
            this.playlistsTab.playlistsList.setAttribute('uri', newVal);
            this.playlistsTab.header = this.header;

            this.setState(this.state);
            this.activate();
            setTimeout(() => this.header.scroll(),
            100)
            
        }
    }
    setState(state) {
        this.header.setState(state);
    }
}