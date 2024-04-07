
    export default class SPSelectElement extends HTMLElement {
        connectedCallback() {
            this.state = {objects: []};
            this.select = document.createElement('select');
            this.appendChild(this.select);
        }
        get dataSource() {
            return this._dataSource;
        }
        set dataSource(value) {
            this._dataSource = value;
            this._dataSource.table = this;
            this._dataSource.onchange = (e) => {
                let evt = new CustomEvent('change');
                this.dispatchEvent(evt);
                this.state.objects = this.dataSource.rows;
                this.render();
                let firstRow = this.querySelector('tr');
               /* if (firstRow) {
                    let th = this.querySelector('th');
                    let size = (firstRow.getBoundingClientRect().height * 2) + 'pt ' + (firstRow.cells[0].getBoundingClientRect().height * 1.5) + 'pt';
                    this.parentNode.style.backgroundSize =  size;
                    let tablestart = th.getBoundingClientRect().top + th.getBoundingClientRect().height;
                    this.parentNode.style.backgroundPosition = '0pt ' +  (tablestart) +  'pt';
                }*/
        
            }
            
            this.render();
        }
        fetchNext() {
            this.dataSource.fetchNext();
        }
       setState(state) {
           this.state = state;
           this.render();
       }
       attributeChangedCallback(attrName, oldVal, newVal) {
           if (attrName === 'uri') {
               this.dataSource.uri = newVal;
               this.dataSource = this.dataSource;
               this.fetchNext();
           }
       }
       set value(value) {
           let options = this.querySelectorAll('option');
           for (let option of options) {
               if (option.getAttribute('value') == value) {
                   if (!option.hasAttribute('selected'))
                   option.setAttribute('selected', 'selected');
               } else {
                   if (option.hasAttribute('selected'))
                   option.removeAttribute('selected');
               }
           }
       }
       get value() {
            let value = this.select.options[this.select.selectedIndex].value;
            return value;
       }
       render() {
           this.select.innerHTML = '';
           if (this.state != null)
           for (let object of this.state.objects) {
               let option = document.createElement('option');
               option.setAttribute('value', object.id);
               option.innerHTML = object.name;
               this.select.appendChild(option);
           }
       }
    }
