import SPResolver from '/js/plugins/buddhalow/resolver.js'

export default class SPSpotifyResolver extends SPResolver {
    static acceptsUri(uri) {
        return /^spotify:(.*)$/.test(uri);
    }
    request(method, uri, params, payload, cache=true) {
        if (!uri) return;
        let strongUri = (uri + '?' + (params instanceof Object ? serializeObject(params) : ''));
        if (strongUri in this.state && method == "GET" && cache) {
                
            return this.state[strongUri];
        }
        try {
            let esc = encodeURIComponent
            let query = params ?  Object.keys(params)
                    .map(k => esc(k) + '=' + esc(params[k]))
                    .join('&') : '';

            if (uri == null) return;
            var url = uri;
            if (uri.indexOf('bungalow:') == 0 || uri.indexOf('spotify:') == 0) {
                url = '/api/spotify/' + url.split(':').slice(1).join('/') + '?' + query;
                
                let result
                if (method === 'GET') {
                    result = fetch(url, {
                        credentials: 'include',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        method: 'GET',
                    }).then((e) => {
                        if (e.status < 200 || e.status > 299) {
                            alert(e.status);
                        }
                        return e.json()
                        
                    
                    });
                } else {
                    result = fetch(url, {
                        credentials: 'include',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        method: method,
                        body: JSON.stringify(payload)
                    }).then((e) => {
                        if (e.status < 200 || e.status > 299) {
                            alert(e.status);
                        }
                        return e.json()
                        
                    });
                }
                
                if ('objects' in result) {
                    for (let obj of result.objects) {
                        let bungalowUri = obj.uri;
                        this.state[bungalowUri] = obj;
                        if (obj.type == 'album') {
                            
                            if ('tracks' in obj) {
                                let trackset = {
                                    objects: []
                                };
                                for (let track of obj.tracks.objects) {
                                    this.state[track.uri] = track;
                                    trackset.objects.push(track);
                                }
                                this.state[obj.uri + ':track?offset=0&limit=0'] = trackset;
                            }
                        }  
                    }
                }
                this.setState(uri, result);


                return result;

            }
            if (uri in this.state)
                return this.state[uri];
            
            let result = fetch(url, {credentials: 'include', mode: 'cors'}).then((e) => e.json());
            this.setState(uri, result);

            return result;
        } catch (e) {
            alert("An error occured " + e);
        }
    }    
}