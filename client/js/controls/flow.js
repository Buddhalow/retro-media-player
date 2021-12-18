import SPResourceElement from '/js/controls/resource.js';
import SPRestDataSource from '/js/plugins/bungalow/datasources/restdatasource.js'

export default class SPFlowElement extends SPResourceElement {
    acceptsUri(uri) {
        return uri === 'bungalow:internal:start';
    }
    static get observedAttributes() {
        return ['uri']
    }
    connectedCallback() {
        super.connectedCallback();
        this.dataSource = new SPRestDataSource()
        this.attributeChangedCallback('uri', null, this.getAttribute('uri'));
    
    }
    render() {
        if (!this.state || !this.state.object || !this.state.object.objects) return;
        this.state.object.objects.map((obj) => {
            let a = document.createElement('sp-item');
            if (this.hasAttribute('tower')) {
                a.setAttribute('tower', this.getAttribute('tower'))
            }
            a.setState(obj);
            this.appendChild(a);
        })
    }
    setState(obj) {
        this.render(obj);
    }
}

