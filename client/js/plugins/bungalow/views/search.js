import SPViewElement from '/js/controls/view.js';

export default class SPSearchViewElement extends SPViewElement {
    static get observedAttributes() {
        return['uri'];
    };
    connectedCallback() {
        super.connectedCallback();
        if (!this.created) {
            this.classList.add('sp-view')
            this.style.overflow = 'hidden';
            //this.innerHTML = "<div style='padding: 13pt'><h3>Search results for '<span id='q'>'</span>";
            this.hook = document.createElement('sp-hook');
            this.hook.setAttribute('data-hook-id', 'searchview');
            this.hook.view = this;
            this.overview = document.createElement('sp-tabcontent');
            this.overview.setAttribute('data-tab-id', 'overview');
            this.overview.appendChild(this.hook);
            this.created = true;
        }
    }
    activate() {

        GlobalTabBar.setState({
            objects: [
                {
                    id: 'overview',
                    name: _e('Overview')
                }
            ]
        });
    }
    acceptsUri(uri) {
        return /^bungalow:search:(.*)$/.test(uri);
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'uri') {
            this.hook.setState({
                uri: newVal,
                q: newVal.split(/:/)[2]
            });
            super.afterLoad();
        }
    }
}
