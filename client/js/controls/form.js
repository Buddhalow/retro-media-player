export default class SPFormElement extends HTMLFormElement {
    connectedCallback() {
            this.addEventListener('submit', (e) => {
            e.preventDefault();
            this.save();
        })
        
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'data-object-id') {
            if (!newVal) return;
            this.value = this.dataSource.getObjectById(newVal);  
        }
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this.setAttribute('data-object-id', value);
        
    }
    get dataSource() {
        return this._dataSource;
    }
    set dataSource(value) {
        this._dataSource = value;
        this.render();
    }
    get fields() {
        if (!this._fields) {
            return {};
        }
        return this._fields;
    }
    set fields(value) {
        this._fields = value;
    }
    get label() {
        return this.getAttribute('label');
    }
    set label(value) {
        this.setAttribute('label', value);
    }
    get value () {
        var data = {};
        let inputs = this.querySelectorAll('.input');
        for (let input of inputs) {
            data[input.getAttribute('name')] = input.value; 
        }
        data._model = this.model;
        return data;
    }
    set value(value) {
    
        for (let k of Object.keys(value)) {
            let v = value[k];
            let input = this.querySelector('[name="' + k + '"]');
            if (input == null) continue;
            if (input.type == 'datetime-local') {
                input.inputElement.value = moment(v).format('YYYY-MM-DDThh:mm:ss'); 
            } else if (!!v)
            input.value = v;
            if (v == 'null') {
                input.value = '';
            }
        }
    }
    save() {
        return new Promise((resolve, fail) => {
            this.dataSource.saveOrUpdate(this.value).then((obj) => {
                resolve(obj);
            });
        });
    }  
    render() {
        this.innerHTML = '<p>' + this.label + '</p>';
        let input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.classList.add('input');
        input.setAttribute('name', 'id');
        this.appendChild(input);
        for (let k of Object.keys(this.fields)) {
            let field = this.fields[k];
            if (field.type == 'manyToOne') {
                let input = document.createElement('sp-relationfield');
                input.classList.add('input');
                let DataSource = field.model.DataSource;
                input.dataSource = new DataSource(field.model.id, {'name': {type: 'text'}});
                input.type = field.type;
                input.label = field.label;
                input.name = field.id;
                input.model = field.model.id;
                input.fields = field.model.fields;
            
                this.appendChild(input);
            } else {
                
                let input = document.createElement('sp-formfield');
                input.classList.add('sp-nested-form');
                input.classList.add('input');
                input.type = field.type;
                input.name = field.id;
                input.label = field.label;
                this.appendChild(input);
            }
        }
        
    }
    load(id) {
        this.obj = this.dataSource.getObjectById(id);
        this.sync();
    }
}
