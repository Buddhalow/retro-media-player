import SPViewElement from '/js/controls/view.js';
import store from '/js/plugins/spotify/store.js';

export default class SPLabelViewElement extends SPViewElement {
    connectedCallback() {
        super.connectedCallback();
        this.classList.add('sp-view');
        this.header = document.createElement('sp-header');
        this.appendChild(this.header);
        this.releasecontext = document.createElement('sp-flow');
        this.divider = document.createElement('sp-divider');
        this.divider.innerHTML = _('Releases');
        this.artistcontext = document.createElement('sp-flow')
        this.created = true;
        this.overviewSection = document.createElement('sp-tabcontent');
        this.releasesSection = document.createElement('sp-tabcontent');
        this.artistsSection = document.createElement('sp-tabcontent');
        this.tracksSection = document.createElement('sp-tabcontent');
        this.overviewSection.setAttribute('data-tab-id', 'overview');
        this.releasesSection.setAttribute('data-tab-id', 'releases');
        this.artistsSection.setAttribute('data-tab-id', 'artists');
        this.tracksSection.setAttribute('data-tab-id', 'tracks');
        this.container = document.createElement('div')
        this.container.classList.add('container')
        this.appendChild(this.container)

        this.topTracks = document.createElement('sp-playlist')
        this.topTracks.columnheaders = ['name', 'artists']
        this.overviewSection.innerHTML = '<sp-divider>' + _('top-tracks') + '</sp-divider>'
        this.trackcontext = document.createElement('sp-trackcontext')
        this.trackcontext.setAttribute('expand', 'true')
        this.trackcontext.setAttribute('fill', 'true')
        this.trackcontext.setAttribute('showcolumnheaders', 'true')
        
        
        this.overviewSection.appendChild(this.topTracks);
        this.releasesSection.appendChild(this.releasecontext);
        this.artistsSection.appendChild(this.artistcontext);
        this.tracksSection.appendChild(this.trackcontext);

        this.container.appendChild(this.overviewSection);
        this.container.appendChild(this.releasesSection);
        this.container.appendChild(this.artistsSection);
        this.container.appendChild(this.tracksSection);
        this.aboutDivider = document.createElement('sp-divider')
        this.aboutDivider.innerHTML = _('about')
        this.overviewSection.appendChild(this.aboutDivider);
        this.description = document.createElement('p')
        this.description.innerHTML = 'No description found'
        this.overviewSection.appendChild(this.description)
        this.attributeChangedCallback('uri', null, this.getAttribute('uri'));
    
    
    }
    activate() {
        super.activate()
        this.header.tabBar.setState({
            objects: [
                {
                    name: _('overview'),
                    id: 'overview'
                },
                {
                    name: _('releases'),
                    id: 'releases'
                },
                {
                    name: _('artists'),
                    id: 'artists'
                },
                {
                    name: _('tracks'),
                    id: 'tracks'
                },
                {
                    name: _('about'),
                    id: 'about'
                }
            ]
        })
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName == 'uri') {
            if (newVal == null) return;
            this.releasecontext.setAttribute('uri', newVal + ':release');
            this.topTracks.setAttribute('uri', newVal + ':top:5');
            this.artistcontext.setAttribute('uri', newVal + ':artist');
            this.trackcontext.setAttribute('uri', newVal + ':top:30:track');
            this.obj = store.request('GET', newVal);
            this.obj.followers = {
                count: 0
            }
            this.setState(this.obj);
        }
    }
    setState(obj) {
        this.header.setState({
            object: {
                type: 'label',
                name: obj.name,
                followers: {
                    count: 0
                }
            }
        });
    }
}