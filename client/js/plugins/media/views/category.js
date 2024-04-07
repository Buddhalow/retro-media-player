import SPViewElement from '/js/controls/view.js';
import store from '/js/plugins/media/store.js';
export default class SPCategoryViewElement extends SPViewElement {
    connectedCallback() {
        super.connectedCallback();
        if (!this.created) {

            this.useSpider = false;
            if (this.useSpider) {
                this.templateUrl = '/js/plugins/media/template/category.html'
                this.attributeChangedCallback('uri', null, this.getAttribute('uri'))
                return
            }

            this.header = document.createElement('sp-header');
            this.appendChild(this.header);
            this.classList.add('sp-view');
            this.overview = document.createElement('sp-tabcontent');
            this.container = document.createElement('div')
            this.container.classList.add('container');
            this.container.appendChild(this.overview);
            this.overview.setAttribute('data-tab-id', 'overview');

            this.state = {};

            if (!this.albumsDivider) {
                this.overview.albumsDivider = document.createElement('sp-divider');
                this.overview.albumsDivider.innerHTML = 'Public playlists';
                this.overview.appendChild(this.overview.albumsDivider);
            }
            this.flow = JSON.parse(localStorage.getItem('theme')).stylesheet == 'maestro';
            if (this.flow) {
                this.overview.releaseFlow = document.createElement('sp-flow');
                this.overview.appendChild(this.overview.releaseFlow);
            } else {
                this.overview.albumList = document.createElement('sp-flow');
                this.overview.appendChild(this.overview.albumList);
            }

            this.appendChild(this.container)
            this.attributeChangedCallback('uri', null, this.getAttribute('uri'))
            this.created = new Date();
        }
    }
    acceptsUri(uri) {
        return new RegExp(/^bungalow:category:(.*)$/g).test(uri);
    }
    navigate(uri) {
            
    }
    activate() {
        setTimeout(() => this.header.scroll(),
        100)
    }
    async setUri(newVal) {
        newVal = 'spotify:' + newVal.split(':').splice(1).join(':');
        let result = await store.request('GET', newVal);
        if (this.flow) {
            this.overview.releaseFlow.setAttribute('uri', newVal + ':playlist');
        } else {
            this.overview.albumList.setAttribute('uri', newVal + ':playlist');
        }
        result.owner = {
            id: 'spotify',
            uri: 'spotify:start',
            type: 'view',
            name: _e('categories')
        }
        this.header.setState({object: result, major: true})
        this.setState(result);
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {

            if (this.useSpider) {
                this.template = '/js/plugins/media/templates/category.html'
                this.loadByTemplate()

            } else {
                newVal = 'spotify:' + newVal.split(':').splice(1).join(':');
                let result = store.request('GET', newVal);
                if (this.flow) {
                    this.overview.releaseFlow.setAttribute('uri', newVal + ':playlist');  
                } else {
                    this.overview.albumList.setAttribute('uri', newVal + ':playlist');  
                }
                result.owner = {
                    id: 'spotify',
                    uri: 'spotify:start',
                    type: 'view',
                    name: _e('categories')
                }
                this.header.setState({object: result, major: true})
                this.setState(result);   
            } 
        }
    }
    setState(state) {
        this.state = state;
    
        this.header.setState(state);
        this.header.tabBar.setState({
            object: this.state,
            objects: [{
                id: 'overview',
                name: this.state.name
            }]
        })
        this.render();
    }
    render() {
        
    }
}