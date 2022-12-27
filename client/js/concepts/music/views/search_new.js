import SPViewElement from '/js/controls/view.js';
import store from '/js/concepts/music/store.js';

export default class SPSearchViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
    connectedCallback() {

        super.connectedCallback();
        if (this.created2) return
        this.sections = {}
        this.classList.add('sp-view');
        this.header = document.createElement('sp-header');
        this.appendChild(this.header);
        this.divider = document.createElement('sp-divider');
        this.divider.innerHTML = _e('releases');
        this.artistcontext = document.createElement('sp-flow')
        this.created = true;
        this.overviewSection = document.createElement('sp-tabcontent');
        this.tracksSection = document.createElement('sp-tabcontent');
        this.overviewSection.setAttribute('data-tab-id', 'overview');
        this.tracksSection.setAttribute('data-tab-id', 'tracks');
        this.container = document.createElement('div')
        this.container.classList.add('container')
        this.appendChild(this.container)

        this.entities = ['release', 'playlist']
        for (let entity of this.entities) {
            this.createSectionForEntity(entity, entity + 's', 'sp-flow')
        }
        this.topTracks = document.createElement('sp-album')
        this.topTracks.columnheaders = ['p', 'name', 'duration', 'popularity', 'artists']
        this.topTracks.limit = 5
        this.overviewSection.innerHTML = '<sp-divider>' + _e('top-tracks') + '</sp-divider>'
        this.trackcontext = document.createElement('sp-trackcontext')
        this.trackcontext.setAttribute('expand', 'true')
        this.trackcontext.setAttribute('fill', 'true')
        this.trackcontext.setAttribute('showcolumnheaders', 'true')
        this.trackcontext.setAttribute('columnheaders', '_,p,name,duration,artists,album')


        this.overviewSection.appendChild(this.topTracks);

        this.container.appendChild(this.overviewSection);
        this.container.appendChild(this.tracksSection);
        this.aboutDivider = document.createElement('sp-divider')
        this.aboutDivider.innerHTML = _e('artists')
        this.overviewSection.appendChild(this.aboutDivider);
        this.artistflow = document.createElement('sp-flow')
        this.artistflow.limit = 5
        this.overviewSection.appendChild(this.artistflow)
        this.attributeChangedCallback('uri', null, this.getAttribute('uri'));
        this.created2 = true
    }
    createSectionForEntity(type, label, elm) {

        let section = document.createElement('sp-tabcontent');
        section.setAttribute('data-tab-id', type + 's');
        this.container.appendChild(section);
        this.sections[type] = section
        section.context = document.createElement(elm)
        section.appendChild(section.context)
        return section
    }
    activate() {
        super.activate()
        window.GlobalTabBar.setState({
            object: this.obj,
            objects: [
                {
                    name: _e('overview'),
                    id: 'overview'
                },
                {
                    name: _e('news'),
                    id: 'news'
                },
                ...this.entities.map(
                    e => {
                        return {
                            name: _e(e + 's'),
                            id: e + 's'
                        }
                    }
                ),
                {
                    name: _e('about'),
                    id: 'about'
                }
            ]
        })
        this.header.scroll()
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'uri') {
            if (newVal == null) return;
            this.topTracks.setAttribute('uri', newVal + ':top:5');

            this.trackcontext.setAttribute('uri', newVal + ':track');
            this.artistflow.setAttribute('uri', newVal + ':artist')
            for (let sectionId of Object.keys(this.sections)) {
                let context = this.sections[sectionId].context
                context.setAttribute('uri', newVal + ':' + sectionId)
            }
            this.obj = store.request('GET', newVal)
            this.obj.name = this.obj.id
            this.setState(this.obj);
            this.activate()
        }
    }
    setState(obj) {
        this.header.setState({
            object: obj
        });
    }
}
