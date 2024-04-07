import SPTableElement from '/js/controls/table.js';
import SPEpisodeTableDesigner from '/js/plugins/media/designers/episodetabledesigner.js';
import SPRestDataSource from '/js/plugins/bungalow/datasources/restdatasource.js';
import SPTrackTableDelegate from '/js/plugins/media/elements/tracktabledelegate.js';

export default class SPEpisodeContextElement extends SPTableElement {
    connectedCallback() {
        super.connectedCallback();
        if (!this.created2) {
            this.columnheaders = ['name'];
            this.created2 = true;
                this.designer = new SPEpisodeTableDesigner();
            this.dataSource = new SPRestDataSource('', this.query, this.fields, this.maxRows);
            this.delegate = new SPTrackTableDelegate(this);
            let uri =  this.getAttribute('uri');

            this.dataSource.limit = 3;

            this.attributeChangedCallback('uri', null, uri);
            this.attributeChangedCallback('fields', null, this.getAttribute('fields'));
            this.created2 = true
        }
    }
}
