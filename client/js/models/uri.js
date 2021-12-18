import {strToQuerystring, parseQueryString} from '/js/util/string.js'

    export default class Uri {
        constructor(uri) {
            this.uri = uri;
            
        }
        get uri() {
            return this._uri;
        }
        set uri(value) {
            this._uri = value;
            this.fragments = value.split('#');
            this.fragment = this.fragments[1];
            this.bigparts = this.fragments[0].split('?');
            this.path = this.bigparts[0];
            this.parts = this.path.split(/\:/);
            
            this.protocol = this.parts[0];
            this.service = this.protocol;
            this.app = this.parts[1];
            this.path = this.parts.slice(2);
            this.querystring = value.split('?')[1];
            if (!!this.querystring)
                this.query = strToQuerystring(this.querystring);
            
            if (!this.query) {
                this.query = {service: this.protocol};
            }
            if ('service' in this.query) {
                this.service = this.query['service'];
            }
            this.querystring = parseQueryString(this.query);
     
        }
        toUri() {
            return this.service + ':' + this.app + ':' + this.path.join(':');
        }

        get pathname() {
            return '/' + this.app + '/' + this.path.join('/');
        }
        get url() {
            let path = window.location.protocol + '://' + window.location.host + this.pathname;
            if (!!this.fragment) {
                path += '#' + this.fragment;
            }
            return path;
        }
        
    }
