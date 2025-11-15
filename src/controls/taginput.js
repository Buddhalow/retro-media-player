
    export default class SPTagInput extends HTMLElement {
        constructor() {
            super();
        }
        addTag(obj) {
            let tag = document.createElement('sp-tag');
            tag.style.display = 'inline-block';
            tag.innerHTML = obj.name;
            tag.style.cssFloat = 'left';
            this.inputElement.value = '';
            tag.setAttribute('data-id', obj.id);
            tag.closeButton = document.createElement('a');
            tag.closeButton.addEventListener('click', (e) => {
               this.removeChild(tag); 
            });
            tag.closeButton.innerHTML = ' (x)';
            tag.appendChild(tag.closeButton);
            this.removeChild(this.inputElement);
            this.appendChild(tag);
            this.appendChild(this.inputElement);
            
        }
        create() {
            
            this.classList.add('form-control');
            this.inputElement = document.createElement('input');
            this.resultElement = document.createElement('sp-result');
            this.appendChild(this.resultElement);
            this.appendChild(this.inputElement);
            this.inputElement.cssFloat = 'left';
            this.inputElement.addEventListener('keyup', (e) => {
               let result = this.dataSource.find(e.target.value);
        
               this.resultElement.innerHTML = '';
               this.resultElement.style.display = 'block';
               this.resultElement.style.position = 'absolute';
               let bounds = this.getBoundingClientRect();
               this.resultElement.style.left = bounds.left + 'px';
               this.resultElement.style.top = bounds.y + 'px ' + bounds.bottom + 'px';
               this.resultElement.style.width = bounds.width;
            this.resultElement.innerHTML = '';
               for (let obj of result) {
                    let row = document.createElement('a');
                    row.setAttribute('data-id', obj.id);
                    row.innerHTML = obj.name;
                    row.addEventListener('click', (e) => {
                        this.addTag(obj);
                        this.resultElement.style.display = 'none';
                    });
                    this.resultElement.appendChild(row);
               }
            });
        }
        connectedCallback() {
            this.classList.add('input');
            this.innerHTML = '';
            this.create();
            
        }
        get value() {
            let items = [];
            let tags = this.querySelectorAll('sp-tag');
            for (let tag of tags) {
                items.push({
                    id: tag.getAttribute('data-id'),
                    name: tag.innerHTML
                });
            }
            return items;
        }
        set value(value) {
            this.innerHTML = '';
            this.create();
            for (let obj of value) {
                this.addTag(obj);
            }
        }
    }
