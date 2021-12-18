
export default class SPImageElement extends HTMLElement {
    static get observedAttributes() {
        return ['size', 'uri', 'src']
    }
    get size() {
        if (!this.hasAttribute('size'))
            return getComputedStyle(document.body).getPropertyValue("--image-size")
        return this.getAttribute('size')
    }
    set size(value) {
        this.setAttribute('size', value)
    }
    connectedCallback() {
        if (this.created) return
        let size = this.size

        this.attributeChangedCallback('src', null, this.getAttribute('src'));
        this.attributeChangedCallback('width', null, this.getAttribute('height'));
        this.attributeChangedCallback('size', null, this.getAttribute('size'));
        if (this.hasAttribute('uri')) {
            this.addEventListener('click', (e) => {
                if (e.target.hasAttribute('uri')) {
                    GlobalViewStack.navigate(e.target.getAttribute('uri'));
                }
            })
            this.setAttribute('draggable', true);
            this.addEventListener('dragstart', (e) => {
                    let text = e.target.getAttribute('uri');

                    event.dataTransfer.setData("Text",text);
            })
        }
        this.created = true
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'src') {
                this.style.backgroundImage = 'url(' + newVal + ')';
        }
        if (attrName === 'size') {
            this.style.width = newVal + 'px';
            this.style.height = newVal + 'px';
        }
        if (attrName === 'width') {

            this.style.width = newVal;
            this.style.height = newVal;
        }
        if (attrName === 'height') {
            this.style.height = newVal;

        }
    }
    setState(object) {
        if (object.images && object.images.length > 0)
            this.style.backgroundImage = 'url(' + object.images[0].url + ')';
    }
}
