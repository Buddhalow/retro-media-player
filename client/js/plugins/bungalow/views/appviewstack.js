import SPViewElement from '/js/controls/view.js';
    
export default class SPAppViewStackView extends SPViewElement {
    connectedCallback() {
        super.connectedCallback();
        this.classList.add('sp-view');
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'uri' || attrName === 'href') {
            this.navigate(newVal);
        }
    }
    setHash(id) {
        if (this.app) {
            this.app.setHash(id);
        }
    }
    get uri() {
        return this.getAttribute('uri');
    }
    set uri(value) {
        this.setAttribute('uri', value);
    }
    async setUri(uri, isHistory) {
        let bundleId = uri.split(/\:/)[2];

        if (this.app && this.app.getAttribute('data-bundle') == bundleId) {
            this.app.postMessage({
                arguments: uri.substr('bungalow:' + bundleId + ':'.length).split(/\:/),
                uri: uri,
                hash: window.location.hash.substr(1)
            });

            return;
        }
        if (!isHistory) {
            var pathname = uri.substr(uri.split(':')[0].length).replace(/\:/, '/');
            history.pushState(uri, '', pathname);
        }
        var apps = this.querySelectorAll('sp-app');
        for(let i = 0; i < apps.length; i++) {
            apps[i].setAttribute('hidden', true);
            
        }
        
        window.fetch('/api/app', {
            credentials: 'include',
            mode: 'cors',
        }).then((resp) => resp.json()).then((data) => {

            for (var i = 0; i < data.objects.length; i++) {
                let appManifest = data.objects[i];
                if (new RegExp(appManifest.AcceptsUri).test(uri)) {
                    var app = this.querySelector('sp-app[data-bundle="' + appManifest.BundleIdentifier + '"]');
                    if (app) {
                        if (app.hasAttribute('hidden'))
                        app.removeAttribute('hidden');
                        this.app = app;
                    } else {
                        app = document.createElement('sp-app');
                        app.setAttribute('data-bundle', appManifest.BundleIdentifier);
                        app.addEventListener('load', (event) => {
                            event.target.navigate(uri);
                        });
                        this.app = app;
                        if (app.hasAttribute('hidden'))
                        app.removeAttribute('hidden');
                        this.appendChild(app);
                        app.addEventListener('load', (e) => {
                            app.postMessage({
                                uri: uri,
                                arguments: uri.substr('bungalow:' + appManifest.BundleIdentifier + ':'.length).split(/\:/),
                                fragment: window.location.hash.substr(1)
                            }, '*')
                        })
                    }
                    window.currentAppId = appManifest.BundleIdentifier;
                    GlobalTabBar.setState({
                        objects: appManifest.DefaultTabs || [{
                            id: 'overview',
                            name: _e('Overview')
                        }]
                    });
                } else {
                    let app = this.querySelector('sp-app[data-bundle="' + appManifest.BundleIdentifier + '"]');
                    if (!!app) {
                        if (appManifest.BundleIdentifier === app.getAttribute('data-bundle')) {
                            this.app = app;
                            app.removeAttribute('hidden');
                        } else {
                            app.setAttribute('hidden', true);
                        }
                    }
                }
            }
        });
    
    
        var evt = new CustomEvent('navigated');
        evt.data = {
            uri:uri,
            history: isHistory
        };
        this.dispatchEvent(evt);
    
    }
}
