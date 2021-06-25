import SPViewElement from '/js/controls/view.js';
import store from '/js/plugins/spotify/store.js';

export default class SPSpotifyStartViewElement extends SPViewElement {
    acceptsUri(uri) {
        return uri === 'spotify:start';
    }
    navigate() {

    }
    connectedCallback() {
        let featured = store.request(
            'GET',
            'spotify:featured:playlist'
        )
        console.log('featured', featured)
        this.innerHTML += `<sp-tabcontent data-tab-id="overview"><div class="container"><sp-divider>${_e(featured.message)}</sp-divider><sp-flow uri="spotify:featured:playlist" limit="6"></sp-flow><sp-divider>${_e('categories')}</sp-divider><sp-flow uri="spotify:category"></sp-flow></div></sp-tabcontent>`
    }
}