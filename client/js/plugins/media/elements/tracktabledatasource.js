import SPTableDataSource from '/js/controls/tabledatasource.js';
import store from '/js/plugins/media/store.js';
export default class SPTrackTableDataSource extends SPTableDataSource {
    constructor(uri, q, fields, limit = 68) {
        super();
        this.uri = uri;
        this.q = q;
        this.limit = limit;
        if (limit) {
            this.limitRows = true;
        }
        this.objects = [];
        this.offset = 0;
        this.fields = fields;
        
        var event = new CustomEvent('createdtabledatasource', {datasource: this});
        document.dispatchEvent(event);
        this.loaded = false;
    }
    refresh() {
        this.rows = [];
        let count = this.offset + this.limit;
        this.offset = 0;
        for (let i = 0; i < count; i+= this.limit) {
            let result = store.request('GET', this.uri, {q: this.q, limit: this.limit, offset: this.offset}, null, false);
            if (!!result && 'objects' in result && result.objects instanceof Array)
            this.objects = result.objects;
        }
        if (this.onchange instanceof Function) {
            this.onchange.call(this);
            this.loaded = true;
        }
    }
    fetchNext() {

        let result = store.request('GET', this.uri, {q: this.q, limit: this.limit, offset: this.offset});
        if (!!result && 'objects' in result && result.objects instanceof Array)
        this.objects = result.objects;
        if (this.onchange instanceof Function) {
            this.onchange.call(this);
        }
    }
    get canReorderRows() {
        return true;
    }
    reorderRows(indicies, newPos) {
        let data = {range_start: indicies[0], range_length: indicies[indicies.length - 1], insert_before: newPos};
    
        let result = store.request('PUT', this.uri, {}, data);
        this.refresh();
    }
    insertObjectsAt(objects, position) {
        let data = {uris: objects.map(o => o.uri), position: position};
        let result = store.request('POST', this.uri + ':track', {}, data);
        this.refresh();
    }
    getNumberOfRows(row) {
        if (!row) {
            if (this.table.maxRows > 0 && this.table.maxRows < this.objects.length)
                return this.table.maxRows;
            return this.objects.length;
        }
    }
    getRowAt(index, row) {
        return this.objects[index];
    }
    get numberOfColumnHeaders () {
        return this.fields.length;
    }
    getColumnAt(pos) {
        return this.fields[pos];
    }
}
