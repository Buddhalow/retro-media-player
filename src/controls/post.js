
    export default class SPPostElement extends HTMLElement {
        connectedCallback() {
            
        }
        setState(state) {
            this.state = state;
            this.render();
        }
        render() {
            try {
                let template = _.template(_.unescape(document.querySelector('#postTemplate').innerHTML));
                this.innerHTML = template(this.state);
                this.form = this.querySelector('form');
                this.select = this.querySelector('sp-select');
                if (this.state.object.attachment) {
                    this.attachment = document.createElement('sp-attachment');
                    this.querySelector('.attachment-room').appendChild(this.attachment);
                    if (this.state.object.attachment.uri.indexOf('http://open.spotify.com') == 0 || this.state.object.attachment.uri.indexOf('https://open.spotify.com') == 0 || this.state.object.attachment.uri.indexOf('http') != 0) {
                        this.attachment.setAttribute('uri', this.state.object.attachment.uri);
                    } else {
                        this.attachment.setState({object: this.state.object.attachment});
                    }
                }
                
                // TODO Separate this code from the logic
                
                this.select = this.querySelector('sp-select');
                if (!!this.select) {
                    this.select.dataSource = this.state.object.selectDataSource;
                    this.select.setAttribute('uri', 'buddhalow:post');
                     this.form.querySelector('textarea').addEventListener('change', (e) => {
                        let url = e.target.value.getUrl();
                        if (url != null && url.length > 0) {
                            if (this.attachment != null) {
                                this.attachment.parentNode.removeChild(this.attachment);
                            }
                            this.attachment = document.createElement('sp-attachment');
                            this.querySelector('.attachment-room').appendChild(this.attachment);
                            this.attachment.setAttribute('uri', url);
                        }
                    })
                }
                this.form.addEventListener('submit', (e) => {
                   
                    e.preventDefault();
                    this.form.style.opacity = 0.5;
                    let post = {
                        description: this.form.querySelector('textarea').value,
                        profileId: this.select.value,
                        
                    };
                    if (this.attachment != null && this.attachment.state && this.attachment.state.object != null)
                        post.attachment = this.attachment.state.object;
                    this.list.dataSource.push(post);
                    return false;
                })
            } catch (e) {
                alert(e);
            }
        }
    }
