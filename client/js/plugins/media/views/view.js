import SPViewElement from '/js/controls/view.js';

export default class SPMediaViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
}
