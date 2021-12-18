import SPViewElement from '/js/controls/view.js';
    export default class SPModelViewElement extends SPViewElement {
            connectedCallback() {
                this.content = document.createElement('div');
                this.classList.add('sp-view');
            }
            activate() {
                super.activate();
                GlobalTabBar.setState({
                    objects: [{
                        id: 'overview',
                        name: _e(this.label)
                    }]
                }); 
                this.created = true;
            }
            get type() {
                return this.getAttribute('type');
            }
            set type(value) {
                this.setAttribute('type', value);
            }
            get label() {
                return this.getAttribute('label');
            }
            set label(value) {
                this.setAttribute('label', value);
            }
            get model() {
                return this.getAttribute('model');
            }
            set model(value) {
                this.setAttribute('model', value);
            }
            get description() {
                return this.getAttribute('description');
            }
            set description(value) {
                this.setAttribute('description', value);
            }
            attributeChangedCallback(attrName, oldVal, newVal) {
                if (attrName === 'uri') {
                    this.innerHTML = '';
                    this.section = document.createElement('sp-tabcontent');
                    this.section.setAttribute('data-id', 'overview');
                    this.appendChild(this.section);
                    
                    if (newVal === 'bungalow:' + this.model.toLowerCase()) {
                    
                        this.header = document.createElement('sp-header');
                        this.header.setAttribute('size', 128);
                        this.header.setState({
                            type: this.type,
                            name: _e(this.label),
                            uri: 'bungalow:' + this.model.toLowerCase(),
                            type: this.model,
                            description: this.description,
                            buttons: [{
                                label: _('Add'),
                                icon: 'plus',
                                onClick: (e) => {
                                    var dialog = document.createElement('sp-modal');
                                    dialog.label = _e('Add') + ' ' + this.model;
                                    document.body.appendChild(dialog);
                                      dialog.show();
                                  dialog.navigate('bungalow:' + self.model.toLocaleLowerCase() + ':add');
                                  
                                }
                            }]
                        });
                        GlobalTabBar.setState({
                            objects: [{
                                id: 'overview',
                                name: _e(this.label)
                            }],
                            add: {
                                uri: 'bungalow:' + self.model.toLocaleLowerCase() + ':add'
                            }
                        }); 
                        this.created = true;
                        this.listView =  document.createElement('sp-table');
                        this.section.appendChild(this.header);
                        if (this.content instanceof Node)
                        this.section.appendChild(this.content);
                        this.containerElement = document.createElement('div');
                        this.containerElement.classList.add('container');
                        this.section.appendChild(this.containerElement);
                        this.containerElement.appendChild(this.listView);
                        this.listView.header = this.header;
                        this.listView.view = this;
                        this.listView.designer = this.tableDesigner;    
                        this.listView.dataSource = this.tableDataSource;
                        this.listView.negative = this.negative;
                        this.listView.emptyText = this.emptyText;
                        this.tableDataSource.fetchNext();
                        var self = this;
                        this.listView.delegate = {
                            onRowDoubleClick(row, obj) {
                                var dialog = document.createElement('sp-modal');
                                    dialog.label = _e('Edit') + ' ' + this.model;
                                    
                                document.body.appendChild(dialog);
                                dialog.navigate('bungalow:' + self.model.toLocaleLowerCase() + ':' + obj.id);
                                dialog.show();
                            },
                            onRowSingleClick() {
                                
                            }
                        };
                        this.created = true;
                    } else {
                        this.containerElement = document.createElement('div');
                        this.containerElement.classList.add('container');
                        this.appendChild(this.containerElement);
                        this.form = document.createElement('sp-form');
                        this.form.dataSource = this.formDataSource;
                        this.form.label = _e('Edit') + ' ' + this.model;
                        this.containerElement.appendChild(this.form);
                        let uri = newVal.split(':');
                        let id = uri[2];
                        this.form.setAttribute('data-object-id', id);
                        
                    }
                } 
            }
            refresh() {
                let uri =this.getAttribute('uri');
                if (!!uri)
                this.attributeChangedCallback('uri', null, uri);
            }
        };

