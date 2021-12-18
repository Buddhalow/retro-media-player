export default class SPAppElement extends HTMLElement {
    connectedCallback() {
        this.iframe = document.createElement('iframe');
        this.appendChild(this.iframe);
        this.iframe.setAttribute('frameborder', '0');
        this.attributeChangedCallback('bundle', null, this.getAttribute('data-bundle'));
        this.iframe.addEventListener('load', (event) => {
            var loadedEvent = new CustomEvent('load');
            
            this.dispatchEvent(loadedEvent);
        })
        window.addEventListener('resize', () => { 
            this.resize();    
        })
    }
    setHash(id) {
        this.iframe.contentWindow.postMessage({
            'hash': id
        }, '*');
    }
    setArguments(args) {
        this.iframe.contentWindow.postMessage({
            arguments: args
        });
    }
    postMessage(msg) {
        this.querySelector('iframe').contentWindow.postMessage(msg, '*');
    }
    resize() {
        this.iframe.width = this.parentNode.clientWidth + 'px';
        this.iframe.height = this.parentNode.clientHeight + 'px';
    }
    attachedCallback() {
        this.resize();
        this.attributeChangedCallback('data-bundle', null, this.getAttribute('data-bundle'));
    }
    navigate(uri) {
        this.iframe.contentWindow.postMessage({
            'type': 'navigate',
            'uri': uri
        }, '*');
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'data-bundle') {
            this.iframe.src = '/apps/' + newVal + '/index.html';
            
            
        }
    }
}
