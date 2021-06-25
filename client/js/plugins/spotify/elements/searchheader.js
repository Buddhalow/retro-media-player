import SPResourceElement from '/js/controls/resource.js';

export default class SPSearchHeaderElement extends SPResourceElement {
    connectedCallback() {
        super.connectedCallback();
        let innerHTML = _.unescape(document.querySelector('#searchHeaderTemplate').innerHTML);
        this.template = _.template(innerHTML);
    
    }
    render() {
        if (!!this.template) {
            let html = this.template(this.state);    
            this.innerHTML = html;
        }
    }
}
