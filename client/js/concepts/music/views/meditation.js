import SPViewElement from '/js/controls/view.js';
import store from '/js/concepts/music/store.js';

export default class SPPlaylistViewElement extends SPViewElement {
    connectedCallback() {
        super.connectedCallback();
        if (this.created2) return
        this.classList.add('sp-view');
        this.header = document.createElement('sp-header');
        this.header.size = 48
        if (localStorage.getItem('showHeaders') === 'true') {
            this.appendChild(this.header);
        }
    
        this.container = document.createElement('div');
        this.container.classList.add('container')
        this.appendChild(this.container);
        this.trackcontext = document.createElement('sp-trackcontext');
        this.trackcontext.setAttribute('expands', 'true');
        this.trackcontext.canReorderRows = true;
        this.trackcontext.canAddRows = true;
        this.trackcontext.canDeleteRows = true;
        this.trackcontext.setAttribute('showcolumnheaders', 'true');
        this.trackcontext.setAttribute('columnheaders', 'name,artists');
        this.trackcontext.setAttribute('headers', 'true');
        this.trackcontext.header = (this.header);
        this.trackcontext.view = (this);
        this.container.appendChild(this.trackcontext);        
        this.created2 = true

    }
    attachedCallback() {

        this.trackcontext.render()
    }
    invalidate() {
        this.invalid = true;
    }
    insertUri(uri, data) {
        $.getJSON('/api/' + data.split(':').join('/') + '/track').then((result) => {
            this.trackcontext.insertObjectsAt(result.objects, 0);
        })
        
    }
    acceptsUri(uri) {
        return /^music:meditation:([a-zA-Z0-9]+)$/.test(uri);
    }
    activate() {
        super.activate();
        if (this.invalid) {
            this.invalid = false;
        }
        this.trackcontext.activate();
        this.header.setState(this.state);
        setTimeout(() => this.header.scroll(),
        100)
        if (this.state == null)
            return;
        
        window.GlobalTabBar.setState({
            object: this.state,
            objects: [{
                name: 'Playlist'
            }]
        });
        
    }
    activateSilent() {
        super.activate();
        if (this.invalid) {
            this.invalid = false;
            this.setAttribute('uri', this.getAttribute('uri'));
        }
        this.trackcontext.activate();
        if (this.state == null)
            return;
        
    }
    navigate(uri) {
    }
    async setUri(newVal) {
        let result = await store.request('GET', newVal)
        this.trackcontext.setAttribute('uri', newVal + ':snapshot:' + result.snapshot_id + ':seed');
        this.header.setState({object: result});     
        this.header.scroll()        
        this.state = result
        this.activate()
        return result        
    }
    get realUri() {
        let username = this.uri.split(/:/)[2]
        let id = this.uri.split(/:/)[4]
        return 'music:user:' + username + ':playlist:' + id 
    }
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {
            
            this.setAttribute('uri', newVal);
            await this.setUri(newVal)
        
            setTimeout(() => this.header.scroll(),
            100)
            /* this.state.features = result.tracks.objects.map((o) => {
                return o.artists[0]
            });
            if (this.state.features.length > 0) {
                this.managerDivider.removeAttribute('hidden');
                    this.state.features.slice(0, 6).map((obj) => {
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
                        image.style.height = '32pt';
                        image.style.width = '32pt';
                    })
            }*/
        }
    }
}