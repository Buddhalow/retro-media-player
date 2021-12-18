import SPViewElement from '/js/controls/view.js';
  
   export default class SPListElement extends SPViewElement {
       connectedCallback() {
          this.state = {
              objects: []
          };
       }
       get dataSource() {
           return this._dataSource;
       }
       set dataSource(value) {
           this._dataSource = value;
       }
       get type() {
           return this.getAttribute('type');
       }
       set type(val) {
           this.setAttribute('type', val);
       }
       pushAll(objects) {
           for (let object of objects) {
                this.push(object);
            }
       }
       push(object) {
           try {
                let entry = document.createElement('div');
                entry.classList.add('post-entry');
                let postElm = document.createElement(this.type);
                postElm.classList.add('container');
                postElm.list = this;
                postElm.setState({object: object});
                entry.appendChild(postElm);
                this.appendChild(entry);
          
                let hr = document.createElement('hr');
                this.appendChild(hr);
            } catch (e) {
                debugger;
            }
       }
       fetchNext() {
         
            this.dataSource.fetchNext();
        
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
                    debugger;
                }*/
        
            }
            this.render();
        }
       setState(state) {
           this.state = state;
           this.render();
       }
       render() {
           this.innerHTML = '';
           for (let object of this.state.objects) {
               this.push(object);
           }
       }
       attributeChangedCallback(attrName, oldVal, newVal) {
           if (attrName === 'uri') {
               this.innerHTML = '';
               this.dataSource.uri = newVal;
               this.dataSource = this.dataSource;
               this.fetchNext();
           }
       }
   } 
