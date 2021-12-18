import SPRestTableDataSource from '/js/plugins/bungalow/datasources/restdatasource.js';
import SPRestTableDesigner from '/js/plugins/bungalow/designers/resttabledesigner.js';
import SPViewElement from '/js/controls/view.js';
export default class SPServiceListViewElement extends SPViewElement {
    activate() {
        super.activate();
        GlobalTabBar.setState({
            objects: [{
                id: 'overview',
                name: _e('Services')
            }]
        });
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.created) {
            this.classList.add('sp-view');
            this.classList.add('container');
            this.table = document.createElement('sp-table');
            this.table.view = this;
            this.table.designer = new SPRestTableDesigner();
            this.table.dataSource = new SPRestTableDataSource();
            this.appendChild(this.table);
            this.table.columnheaders = ['name', 'login'];

            this.table.setAttribute('showcolumnheaders', 'true');
            this.table.setAttribute('uri', 'service?');
        }
    }
}
