import store from '/js/plugins/media/store.js'
import SPDataSource from '/js/controls/datasource.js';

export default class SPResourceTableDataSource extends SPDataSource {
  constructor(resource, fields) {
    super();
    this.fields = fields || ['id', 'name', 'login', 'enabled'];
    this.limit = 50;
    this.offset = 0;
    this.resource = resource;
    this.objects = [];
  }

  getNumberOfChildren(row) {
    return 0;
  }

  getNumberOfRows(row) {
    if (!row) {
      return this.objects.length;
    }
  }

  getRowAt(index, row) {
    if (!row)
      return this.objects[index];
    return null;
  }

  getColumnAt(index) {
    return this.fields[index];
  }

  get numberOfColumnHeaders() {
    return this.fields.length;
  }
  async request(method, uri, options, data) {
    return store.request(method, uri, options, data);
  }
  async oldRequest(method, uri, options, data) {
    
    var url = '/api/'
    if (!options) {
      options = {}
    }
    options.limit = this.limit;

    if (!uri) {

      return
    }

    if (uri.indexOf('/') === 0 || uri.indexOf('http') === 0) {
      url = uri;
    } else {
      url = '/api/' + uri.split(':').join('/');
    }

    if (url.indexOf(':track') === url.length - ':track'.length) {

    }
    var address = url.split(/\?/)[0];
    var qs = url.split(/\?/)[1];
    if (options) {
      qs += '&' + $.param(options)
    }
    url = address + '?' + qs;
    let strongUri = uri + '?' + qs;
    if (method === 'GET' && (strongUri in window.resources)) {
      return window.resources[strongUri];
    }

    var result = {
      objects: []
    }
    let overlay = null;
    try {
      overlay = await fetch('/api/overlay/?uri=' + encodeURIComponent(uri), {
        method: method,
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());
    } catch (e) {

    }
    try {

      result = await fetch(url, {
        method: method,
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      }).then(r => r.json())
      window.resources[strongUri] = $.extend(window.resources[strongUri] || {}, obj);
    } catch (e) {

    }
    if (!!overlay && !!result) {
      result = $.extend(result, overlay);
    } else if (!!overlay) {
      result = overlay;
    }
    return result

  }

  insertObjectsAt(objects, position, uri) {
    let data = {uris: objects.map(o => o.uri), position: position};
    let result = this.request('POST', uri, {}, data);

  }

  reorderObjects(indicies, newPosition, uri) {
    var parts = uri.split(':');
    var snapshot_id = parts[parts.length - 1];
    let data = {range_start: indicies[0], insert_before: newPosition, snapshot_id: snapshot_id};
    let result = this.request('PUT', uri, {}, data);

  }

  replaceObjects(objects, uri) {
    var parts = uri.split(':');
    var snapshot_id = parts[parts.length - 1];
    let data = {uris: objects.map((o) => o.uri)};
    let result = this.request('PUT', uri, {}, data);
  }

  get numberOfFields() {
    return Object.keys(this.fields).length;
  }

  getFieldByIndex(index) {
    return Object.values(this.fields)[index];
  }

}
