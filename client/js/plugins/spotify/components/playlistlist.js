import SPViewElement from '/js/controls/view.js';
import SPResourceTableDelegate from '/js/plugins/spotify/delegates/resourcetabledelegate.js';

export default class SPPlaylistListViewElement extends SPViewElement {
    connectedCallback() {
        super.connectedCallback();
        this.playlistsList = document.createElement('sp-resourcecontext');
        this.playlistsList.setAttribute('showcolumnheaders', 'true');
        this.playlistsList.setAttribute('fill', 'true')
        this.playlistsList.delegate = new SPResourceTableDelegate();
        this.appendChild(this.playlistsList);
    }
    attachedCallback() {
    }
    get view() {
        return this.playlistsList.view;
    }
    set view(value) {
        this.playlistsList.view = value;
    }
    get header() {
        return this.playlistsList.header;
    }
    set header(value) {
        this.playlistsList.header = value;
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName == 'uri') {
            this.playlistsList.setAttribute('uri', newVal + ':playlist');
            
        }
    }
}
