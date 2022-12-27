import SPResourceElement from '/js/concepts/music/elements/resource.js';
import store from '/js/concepts/music/store.js';

export default class SPAudioBookContextElement extends SPResourceElement {
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName == 'uri') {
            this.limit = 3;
            this.offset = 0;
            let uri = newVal;
            let result = store.request('GET', newVal, {limit: this.limit, offset: this.offset});
            this.setState(result);
            if (result != null && result.objects.length > 0 && this.parentNode != null) {
                
                let divider = this.parentNode.querySelector('sp-divider[data-uri="' + newVal + '"]');
                if (divider != null)
                    divider.style.display = 'block';
            }
        }
    }
    createPlaylist (playlist) {
        let elm = document.createElement('sp-playlist');
        if (this.hasAttribute('fields')) {
            elm.setAttribute('fields', this.getAttribute('fields'));
            
        }
        if (this.hasAttribute('data-context-artist-uri')) {

            elm.setAttribute('data-context-artist-uri', this.getAttribute('data-context-artist-uri'));
        }
        elm.setAttribute('uri', 'music:' + playlist.uri.split(':').splice(1).join(':'));
        return elm;
    }
    setState(obj) {
        if (obj && obj.objects instanceof Array) {
            let albums = obj.objects.map((item) => {
                new Promise((resolve, fail) => {
                    setTimeout(() => {
                        resolve();
                    }, 500)
                })
                var a = document.createElement('sp-audiobook');
                if (this.hasAttribute('data-max-rows')) {
                    a.setAttribute('data-max-rows', this.getAttribute('data-max-rows'));
                }
                if (this.hasAttribute('data-context-artist-uri')) {
                    a.setAttribute('data-context-artist-uri', this.getAttribute('data-context-artist-uri'));
                }
                if (this.hasAttribute('fields')) {
                    a.setAttribute('fields', this.getAttribute('fields'));
                }
                let fields = a.getAttribute('fields');
                a.setState({object: item});
                return a;
            });
            albums.forEach((_album) => {
                let album = _album;
                this.appendChild(album);
                
            });
        }
        this.innerHTML += '<sp-gondole></sp-gondole>';
        let gondole = this.querySelector('sp-gondole');
        if (this.parentNode == null) return
        let viewBounds = this.parentNode.getBoundingClientRect();
        if (gondole && gondole.getBoundingClientRect().top < viewBounds.top + viewBounds.height && !gondole.getAttribute('active') === 'true') {
            this.fetchNext();
        }
    }
    fetchNext() {
        if (this.fetching) return;
        this.fetching = true;
        let gondole = this.querySelector('sp-gondole');
        gondole.setAttribute('active', 'true');
        this.offset += this.limit;
        this.removeChild(gondole);
        console.log(this.offset);
        let uri = this.getAttribute('uri') + '?offset=' + this.offset + '&limit=' + this.limit;
        console.log(uri);
        let result = store.request('GET', uri);
        if (result && result.objects instanceof Array && result.objects.length > 0) {
            result.objects.map(this.createPlaylist.bind(this)).map((tr) => {
                this.appendChild(tr);
            });
            this.fetching = false;
            gondole.setAttribute('active', 'false');
            this.appendChild(gondole);

        } else {
            if (this.gondole)
                this.removeChild(this.gondole);
        }
        new Promise((resolve, fail) => {
            setTimeout(() => {
                resolve();
            }, 1000)
        });
    }
    get view() {
        return this._view;
    }
    set view(val) {

        this._view = val;
        this._view.addEventListener('scroll', this._onScroll.bind(this));
    }
    _onScroll(e) {
        let view = e.target;
        let viewBounds = view.getBoundingClientRect();
        let gondole = this.querySelector('sp-gondole');
        if (gondole && gondole.getBoundingClientRect().top < viewBounds.top + viewBounds.height) {
            this.fetchNext();
        }

    }
}
