import SPResourceElement from '/js/controls/resource.js';
    export default class SPAboutArtistElement extends SPResourceElement {
        connectedCallback() {
            super.connectedCallback()
            
            
        }
        setState(obj) {
            let tmp = _.unescape(document.querySelector('#aboutArtistTemplate').innerHTML)
            let template = _.template(tmp)
            let html = template(obj)
            this.innerHTML = html
        }
    }
