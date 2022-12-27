import SPViewElement from '/js/controls/view.js';
import store from '/js/concepts/music/store.js';

export default class SPmusicStartViewElement extends SPViewElement {
    acceptsUri(uri) {
        return uri === 'music:start';
    }
    navigate() {

    }
    connectedCallback() {
        let featured = store.request(
            'GET',
            'music:featured:playlist'
        )
        console.log('featured', featured)
        this.innerHTML += `<sp-tabcontent data-tab-id="overview"><div class="container"><sp-divider>${_e(featured.message)}</sp-divider><sp-flow uri="music:featured:playlist" limit="6"></sp-flow><sp-divider>${_e('categories')}</sp-divider><sp-flow uri="music:category"></sp-flow></div></sp-tabcontent>`
    }
}