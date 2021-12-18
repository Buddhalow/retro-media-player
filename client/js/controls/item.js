import SPResourceElement from '/js/controls/resource.js';

    export default class SPItemElement extends SPResourceElement {
        acceptsUri(uri) {
            return uri === 'bungalow:internal:start';
        }
        render(state) {
            if (!state) return
            try {
                this.innerHTML = '<sp-link uri="' + state.uri + '"><sp-image src="' + state.images[0].url + '"><div class="title"><sp-link  uri="' + state.uri + '">' + state.name.substr(0, 30) + '</sp-link></div></sp-image></sp-link>';
                if (this.hasAttribute('tower')) {
                    let img = this.querySelector('sp-image')
                    img.style.height = parseInt(img.style.width) * 1.8 + 'px'
                }
            } catch (e) {

            }
        
        }
        setState(obj) {
            this.render(obj);
        }
    }
  
