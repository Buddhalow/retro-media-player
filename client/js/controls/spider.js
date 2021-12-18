
    export default class SpiderElement extends HTMLElement {
        render() {
            let elm = document.createElement('div')
            this.html = this. html.replace(/\${uri}/, this.getAttribute('uri'))
            this.innerHTML = this.html
            let elements = this.querySelectorAll('[uri]')
            for (let i = 0; i < elements.length; i++) {
                let elm = elements[i]
                elm.attributeChangedCallback('uri', null, elm.getAttribute('uri'))
             
            }
            let tabcontents = this.querySelectorAll('sp-tabcontent')
            let tabs = []
            for (let tabcontent of tabcontents) {
                tabs.push({
                    id: tabcontent.getAttribute('data-id'),
                    name: tabcontent.getAttribute('name')
                })
                this.querySelector('sp-header').tabBar.setState({
                    objects: tabs
                })
            }
            
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'template') {
                let xmlHttp = new XMLHttpRequest()
                xmlHttp.open('GET', newVal, false)
                xmlHttp.send(null)
                this.html = xmlHttp.responseText;
                this.render()
            }
        }
        get uri() {
            return this.getAttribute('uri')
        }
        set uri(value) {
            this.setAttribute('uri', value)
            this.render()
        }
        set template(value) {
            this.setAttribute('template', value)
            
        }
        get template() {
            return this.getAttribute('template')
        }
        load(src) {

        }
    }        
