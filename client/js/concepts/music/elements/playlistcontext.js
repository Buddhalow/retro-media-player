import SPResourceElement from '/js/concepts/music/elements/resource.js';
import store from '/js/concepts/music/store.js';
export default class SPPlaylistContextElement extends SPResourceElement {
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {
            this.limit = 3;
            this.offset = 0;
            let uri = newVal;
            if (window.storify.nodes[uri]) {
                this.setState(window.storify.nodes[uri])
            }
            let result = await store.request('GET', newVal, {limit: this.limit, offset: this.offset});
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
        let theme = JSON.parse(localStorage.getItem('theme')) || {stylesheet: ''}

        let flow = theme.stylesheet == 'maestro';
        if (flow) {
            this.innerHTML = '<sp-flow uri="' + this.getAttribute('uri') + '"></sp-flow>'
            return
        }
        if (obj && obj.objects instanceof Array) {
            let albums = obj.objects.map((item) => {
                new Promise((resolve, fail) => {
                    setTimeout(() => {
                        resolve();
                    }, 500)
                })
                var a = document.createElement('sp-playlist');
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
                this.appendChild(a);
                return a;
            });
        }
        let gondole = this.querySelector('sp-gondole');
        if (!gondole) {
            let gondole = document.createElement('sp-gondole');
            gondole.style.width = '100%';
            gondole.style.height = '10pt';
            this.appendChild(gondole);
        }
        //  if (this.parentNode == null) return
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
            }, 10)
        });
    }
    get view() {
        return this._view;
    }
    set view(val) {

        this._view = val;
        this._view.addEventListener('scroll', this._onScroll.bind(this));
        ;
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
