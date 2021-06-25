    export default class SPModalElement extends HTMLElement {
        connectedCallback() {
            this.dialog = document.createElement('sp-dialog');
            this.appendChild(this.dialog);
            this.addEventListener('click', (e) => {
                if (e.target === this)
                this.close();
            })
            this.result = 'ok'
        }
        get label() {
            return this.dialog.label;
        }
        set label(value) {
            this.dialog.label = value;
        }
        attachedCallback() {
            
        }
        navigate(uri) {
            
            this.dialog.navigate(uri, true);
        }
        show() {
            this.dialog.show();
            $(this).animate({
                opacity: 1
            }, 1000);
        }
        close() {
            if (!this.dialog.close()) return false;
            $(this).animate({
                opacity: 0,
            
            }, 1000, () => {
                try {
                    this.parentNode.removeChild(this);
                } catch (e) {
                    
                }
            });
            if (this.onclosed != null) {
                this.onclosed(this.result)
            }
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'uri') {
                this.navigate(newVal);
            }
        }
    }    
