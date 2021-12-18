import SPViewElement from '/js/controls/view.js';

class SPStartViewElement extends SPViewElement {
    static get observedAttributes() {
        return ['uri']
    }
    acceptsUri(uri) {
        return uri === 'bungalow:internal:nowplaying';
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
            this.classList.add('sp-view');
            this.style.display = 'flex';
            this.style.flexDirection = 'column';
            this.innerHTML = `
                <div style="flex: 1; background: black">e</div>
                <div style="flex: 0 0 158pt; background: black !important">
                    <bungalow-configview style="background: black !important" instant="true">
                    </bungalow-configview>
                </div>
            `
        }
    }
}
export default SPStartViewElement;
