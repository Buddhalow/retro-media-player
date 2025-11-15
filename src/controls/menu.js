
export default class SPMenuElement extends HTMLElement {
    attachedCallback() {
        
        
        
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
            let menuItem = document.createElement('sp-menuitem');
            this.appendChild(menuItem);
            /*let updated = moment(item.updated_at);
            let now = moment();
            let range = Math.abs(now.diff(updated, 'days'));
            if (range < 1) {
                menuItem.innerHTML = '<i class="fa fa-circle new"></i>';
            }*/
            menuItem.setState(item);
            
        
        }
    }
    
}

