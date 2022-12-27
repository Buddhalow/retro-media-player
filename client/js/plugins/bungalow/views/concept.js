import SPRestDataSource from '/js/plugins/bungalow/datasources/restdatasource.js';
import SPRestTableDesigner from '/js/plugins/bungalow/designers/resttabledesigner.js';
import SPViewElement from '/js/controls/view.js';

export default class SPConceptListViewElement extends SPViewElement {
    activate() {
        super.activate();
        GlobalTabBar.setState({
            objects: [{
                id: 'overview',
                name: _e('Concepts')
            }]
        });
    }
    get created() {
        return this.getAttribute('created') == 'true'
    }
    set created(value) {
        this.setAttribute('created', value)
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.created) {
            this.classList.add('container')
            this.table = document.createElement('sp-table');
            this.table.view = this;
            this.table.columnheaders = ['name', 'enabled'];
            this.table.designer = new SPRestTableDesigner();
            this.table.dataSource = new SPRestDataSource();
            this.table.setAttribute('showcolumnheaders', true);
            this.appendChild(this.table);
            this.table.setAttribute('uri', 'plugin');
            this.classList.add('sp-view');
            this.created = true
        }
    }
}
