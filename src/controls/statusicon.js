export default class SPStatusIconElement extends HTMLElement {
    static get observedAttributes() {
        return ['icon', 'badge'];
    }
    connectedCallback() {
        if (!this.created) {
            this.classList.add('fa');
            this.style.position = 'relative';
            this.attributeChangedCallback('icon', null, this.getAttribute('icon'));

            this.attributeChangedCallback('badge', null, this.getAttribute('badge'));
            this.created = new Date();
            this.style.marginLeft = '13pt';
            this.style.marginRight = '13pt';
            this.style.fontSize = '15pt';
            this.addEventListener('click', (e) => {
                GlobalViewStack.navigate(this.getAttribute('uri'));
            })
        }
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'icon') {
            this.classList.remove(`fa-${oldVal}`);
            this.classList.add(`fa-${newVal}`);
        }
        if (attrName === 'badge') {
            if (!!newVal) {
                this.innerHTML = `<span class="badge" style="padding: 2pt; font-size: 8pt; position: absolute; right: -2pt; top: -5pt;background-color: #ff0000; color: white">${newVal}</span>`;

            } else {
                this.innerHTML = ``;
            }
        }
    }
}
