
    export default class SPFormField extends HTMLElement {
        connectedCallback() {
                
            this.inputElement = document.createElement('input');
            this.labelElement = document.createElement('label');
            this.appendChild(this.labelElement);
            this.appendChild(this.inputElement);
            this.inputElement.classList.add('form-control');
            this.descriptionElement = document.createElement('description');
            this.appendChild(this.descriptionElement);
            this.attributeChangedCallback('name', null, this.getAttribute('name'));
            this.attributeChangedCallback('value', null, this.getAttribute('value'));
            this.attributeChangedCallback('label', null, this.getAttribute('label'));
            this.attributeChangedCallback('type', null, this.getAttribute('type'));
        
            
        }
        get label() {
            return this.getAttribute('label');
        }
        set label(value) {
            this.setAttribute('label', value);
        }
        set type(value) {
            this.setAttribute('type', value);
        }
        get type() {
            return this.getAttribute('type');
        }
        set type(value) {
            this.setAttribute('type', value);
        }
        get name() {
            return this.getAttribute('name');
        }
        set name(value) {
            this.setAttribute('name', value);
        }
        get value() {
            return this.inputElement.value;
        }
        set value(value) {
            this.inputElement.value = value;
        }
        get model() {
            return this.getAttribute('model');
        }
        set model(value) {
            this.setAttribute('model', value);
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'label') {
                this.labelElement.innerHTML = newVal;
            }
            if (attrName === 'type') {
                
                this.inputElement.setAttribute('type', newVal);
            }
            if (attrName === 'name') {
                this.labelElement.setAttribute('for', newVal);
                this.inputElement.setAttribute('name', newVal);
            }
            if (attrName === 'value') {
                this.inputElement.setAttribute('value', newVal);
            }
            if (attrName === 'description') {
                this.descriptionElement.innerHTML = '<summary>' + newVal + '</summary>';
            }
        }
    };
