import SPViewElement from '/js/controls/view.js';

export default class SPSpotifyViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
}
