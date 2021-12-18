import SPViewElement from '/js/controls/view.js';

class SPStartViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
    acceptsUri(uri) {
        return uri === 'bungalow:internal:start';
    }
    navigate() {

    }
    activate() {
        GlobalTabBar.setState({
            objects: [
                {
                    name: _e('start'),
                    id: 'overview'
                }
            ]
        })
    }
    connectedCallback() {
        if (!this.created) {
            this.createDefault()
            this.overviewTab = document.createElement('sp-tabcontent');
            this.overviewTab.setAttribute('data-tab-id', 'overview');
            this.appendChild(this.overviewTab);
            this.classList.add('sp-view');
            this.classList.add('sp-view-linen');
            this.startHook = document.createElement('sp-hook');
            this.startHook.setAttribute('data-hook-id', 'startview');
            this.startHookBottom = document.createElement('sp-hook');

            this.startHookBottom.setAttribute('data-hook-id', 'startviewbottom');
            this.overviewTab.appendChild(this.startHook);
            this.overviewTab.appendChild(this.startHookBottom);
            this.created = new Date();
        }
    }
}
export default SPStartViewElement;
