
    export default class SPAppToolbarElement extends HTMLElement {
        connectedCallback() {
            
        }
        get dataSource() {
            return this._dataSource;
        }
        set dataSource(value) {
            this._dataSource = value;
            this.render();
        }
        setState(state) {
            this.state = state;
            this.render();
        }
        render() {
            this.innerHTML = '';
            if (this._dataSource)
            for (let i = 0; i < this._dataSource.getNumberOfRows(); i++) {
                let item = this._dataSource.getRowAt(i, null);
                if (!item) {
                    this.appendChild(document.createElement('br'));
                    return;
                }
                let menuItem = document.createElement('sp-toolbutton');
                this.appendChild(menuItem);
                menuItem.setState(item);
            }
        }
    }    
