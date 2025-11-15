
    export default class SPAttachmentElement extends HTMLElement {
        connectedCallback() {
            this.state = {
                object: null
            };
            this.render();
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'uri') {
                if (newVal.indexOf('http://open.spotify.com') == 0) {
                    this.setState({uri: 'spotify:' + newVal.split('/').slice(3).join(':')});
                }
                if (newVal.indexOf('https://open.spotify.com') == 0) {
                    this.setState({uri: 'spotify:' + newVal.split('/').slice(3).join(':')});
                }
                if (newVal.indexOf('http://play.spotify.com') == 0) {
                    this.setState({uri: 'spotify:' + newVal.split('/').slice(3).join(':')});
                } else if (newVal.indexOf('http://') == 0) {
                    let object = fetch('/api/lookup?uri=' + encodeURI(newVal), {
                        credentials: 'include', mode: 'cors'
                    }).then(r => r.json());
                    this.setState({
                        object: object
                    });
                } else {
                    if (newVal.indexOf('spotify:') == 0) {
                        this.state.uri = newVal;
                    }
                    
                }
            }
        }
        setState(state) {
            this.state = state;
            this.render();
        }
        render() {
            if (this.state.object) {
                let template = _.template(_.unescape(document.querySelector('#attachmentTemplate').innerHTML));
                this.innerHTML = template(this.state);   
            } else if (this.state.uri) {
                this.innerHTML = '<sp-embeddedresource uri="' + this.state.uri + '"></sp-embeddedresource>';
            } else {
                this.innerHTML = '<sp-throbber></sp-throbber>';
            }
        }
    }
