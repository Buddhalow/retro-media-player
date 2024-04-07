import SPRestDataSource from '/js/plugins/bungalow/datasources/restdatasource.js';

export default class SPResourceElement extends HTMLElement {
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {
            let result = await this.dataSource.request('GET', newVal, {
                limit: this.limit || 50
            });
            this.state = {
                object: result
            };
        }
    }
    static get observedAttributes() {
        return ['uri', 'limit']
    }
    refresh() {
        this.attributeChangedCallback('uri', null, this.getAttribute('uri'));
    }

    get dataSource() {
        return this._dataSource;
    }

    get limit() {
        return parseInt(this.getAttribute('limit'))
    }
    set limit(value) {
        this.setAttribute('limit', value)
    }

    set dataSource(value) {
        this._dataSource = value;
        this._dataSource.onchange = (e) => {
            let evt = new CustomEvent('change');

            this.dispatchEvent(evt);
            this.render();
            let firstRow = this.querySelector('tr');
            /* if (firstRow) {
                let th = this.querySelector('th');
                let size = (firstRow.getBoundingClientRect().height * 2) + 'pt ' + (firstRow.cells[0].getBoundingClientRect().height * 1.5) + 'pt';
                this.parentNode.style.backgroundSize =  size;
                let tablestart = th.getBoundingClientRect().top + th.getBoundingClientRect().height;
                this.parentNode.style.backgroundPosition = '0pt ' +  (tablestart) +  'pt';

            }*/

        }
        this.render();
    }
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
        this.render();
    }
    hideThrobber() {
        this.throbber.style.display = 'none';
    }
    showThrobber() {
        this.throbber.style.display = 'block';
    }
    render() {
        if (!this.state || this.state.object) {
            this.innerHTML = '';
            this.throbber = document.createElement('sp-throbber');
            this.appendChild(this.throbber);
            return;
        }
        let obj = this.state.object;

        this.innerHTML = '<sp-link uri="' + obj.uri + '">' + obj.name + '</sp-link>';
    }
    connectedCallback() {
        if (!this.created1) {
            this.dataSource = new SPRestDataSource();
            this.created1    = true;
        }
    }
    setState(state) {
        this.state = state;
        this.render();
    }
}
