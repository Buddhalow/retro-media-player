import SPViewElement from '/js/controls/view.js';

export default class SPmusicViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
}
