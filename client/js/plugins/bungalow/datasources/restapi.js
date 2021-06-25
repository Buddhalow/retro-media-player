
    export default class RestResource {
        constructor(baseUrl, resource, accessToken) {
            this.baseUrl = baseUrl;
            this.accessToken = accessToken;
            this.resource = resource;
        }
        _request(method, url, params=null, data=null) {
            url = this.baseUrl + url;
            if (!!params) {
                url += '?' + $.param(params);
            }
            return fetch(
                url,
                {
                    method: method,
                    headers: {
                        'Authorization' : 'OAuth' + this.accessToken
                    },
                    body: JSON.stringify(data)
                }
            ).then(r => r.json());
        }
        del(id) {
            return this._request('DELETE', '/' + this.resource + '/' + id);
        }
        find(q) {
           return this._request('GET',
                '/' + this.resource,
                q
            ).then(r => r.json());
        }
        getById(id) {
            return this._request('GET',
                '/' + this.resource + '?',
                q
            ).then(r => r.json());
        }
        post(data) {
            if (!!data.id) {
                return self._request(
                    'PUT',
                    '/' + this.resource + '/' + data.id,
                    null,
                    data
                ).then(r => r.json());
                return;
            } else {
                return self._request(
                    'POST',
                    '/' + this.resource,
                    null,
                    data
                ).then(r => r.json());
            }
        
        }
    }
