import SPResourceElement from '/js/controls/resource.js';
import SPTableDesigner from '/js/controls/tabledesigner.js';

import {getParentElementByClass, getParentElementByTagName} from '/js/util/dom.js'

	/**
     * Table element
     **/
    class SPTableElement extends SPResourceElement {
        constructor() {
            super();
        }
        static get observedAttributes() {
            return ['isfetching', 'uri']
        }
        get state() {
            if (!this._state) {
                this._state = {
                    object: {
                    objects: []

                    }
                };
            }
            return this._state;
        }
        setState(state) {
            this._state = state;
            this.render();
        }
        set state(value) {
            this.setState(value);
        }

        get selectedIndicies() {
            return this._selectedIndicies;
        }
        get selectedObjects() {
            return this.selectedIndicies.map((i) => {
                return this.dataSource.getRowAt(i);
            });
        }
        get sortBy() {
            return this._sortBy;
        }
        set sortBy(value) {
            this._sortBy = value;
            this.render();
        }
        set selectedIndicies(value) {
            this._selectedIndicies = value;

            let trs = this.querySelectorAll('tr');
            for (let i = 0; i < trs.length; i++) {
                trs[i].classList.remove('sp-track-selected');
            }
            this._selectedIndicies.map((i) => {
                let elm = this.querySelector('tr[data-index="' + i + '"]');
                if (elm != null)
                    elm.classList.add('sp-track-selected');
            });
        }
        async fetchNext() {
            if ((this.isFetching || this.hasReachedEnd) && typeof(this._sortBy) === 'string') return;
            let uri =  this.getAttribute('uri')
            if (!uri) {
                if (!this.state)
                    this.state = {
                        object: {
                            objects: []
                        }
                    }
                return
            }
            this.isFetching = true;

            try {
            var result = await this.dataSource.request('GET', uri, {
                limit: this.limit,
                offset: this.offset
            });
            } catch (e) {
                this.isFetching = false
            }

            if (!this.state || !this.state.object) {
                this.state = {
                    object: {
                        objects: []
                    }
                };
            }
            var end = true;
            if (!!result)
            for (let row of result.objects) {
                end = false;
                if (result.objects.length < 1) {
                    end = true;
                }
                this.state.object.objects.push(row);
            }
            if (end) {
                this.hasReachedEnd = true;
            }
            this.render();
            this.offset += this.limit;
            this.isFetching = false;
        }

        get designer() {
            if (!this._designer) {
                return null;
            }
            return this._designer;
        }
        set designer(value) {
            this._designer = value;
            this._designer.table = this;

        }
        reset() {
            if (this.table != null)
            this.table.tbody.innerHTML = '';
            this.offset = 0;
            this.limit = 50;
        }
        get columnheaders() {
            return (this.getAttribute('columnheaders') || '').split(',');
        }
        set columnheaders(val) {
            if (val instanceof Array) {
                val = val.join(',');
            }
            this.setAttribute('columnheaders', val);
            this.render()
        }
        get limit() {
            return parseInt(this.getAttribute('limit'))
        }
        set limit(value) {
            this.setAttribute('limit', value)
        }
        connectedCallback() {
            super.connectedCallback();
            if (!this.created) {
                this.innerHTML = ''
                window.addEventListener('resize', this._onResize.bind(this));
                this.offset = 0;
                this.limit = 50;
                this.history = [];
                this.future = [];
                this._columns = [];
                this.result = {
                    objects : []
                };
                this._selectedIndicies = [];
                this.table = document.createElement('table');
                this.table.thead = document.createElement('thead');
                this.table.thead.tr = document.createElement('tr');
                this.table.thead.appendChild(this.table.thead.tr);
                this.table.appendChild(this.table.thead);
                this.table.tbody = document.createElement('tbody');
                this.table.appendChild(this.table.tbody);
                this.appendChild(this.table);
                this.created = true;

                this.table.setAttribute('tabindex', '0');
                this.created = true
            }

        }
        selectAllRows() {
            $(this, 'tr').addClass('sp-track-selected');
        }
        attachedCallback() {

            this.parentNode.classList.add('table-background');
            this.render();
        }

        activate() {
            // this.checkState();
        }
        get emptyText() {
            return this.emptyLabel.innerHTML;
        }
        set emptyText(value) {
            this.emptyLabel.innerHTML = value;
        }

        get uri() {
            return this.getAttribute('uri');
        }

        set uri(value) {
            this.setAttribute('uri', value);
        }
        set header(val) {
            this._header = val;
        }
        get header() {
            return this._header;
        }
        get view() {
            return this._view;
        }
        set view(val) {

            this._view = val;
            this._view.addEventListener('scroll', this._onScroll.bind(this));
        }
        _onResize(e) {
            this.resize();
        }
        _onScroll(e) {
            let view = e.target;
            let viewBounds = view.getBoundingClientRect();
            let bounds = this.getBoundingClientRect();
            let tabBar = GlobalTabBar.getBoundingClientRect();
            let headerHeight = 0;
            if (this.header) {
                headerHeight = this.header.getBoundingClientRect().height;;
            }
            console.log(bounds.top, viewBounds.top);
            if (view.scrollTop > headerHeight ) {
                view.style.display = 'block';
                let transform = 'translateY(' + ((view.scrollTop - headerHeight) ) + 'px)';
                this.table.thead.style.transform = transform;
            } else {
                this.table.thead.style.transform = 'translateY(0px)';
            }
            this.checkNext();

        }
        async checkNext() {
            if (!this.hasAttribute('expands')) return;
            if (this.parentNode == null) return;
            let view = getParentElementByClass(this, "sp-view");
            if (!view) return;
            let viewBounds = view.getBoundingClientRect();

            let gondole = this.gondole;
            if (gondole && !this.hasReachedEnd && gondole.getBoundingClientRect().top < viewBounds.top + viewBounds.height && typeof(this._sortBy) !== 'string') {
                this.fetchNext();
            }
        }
        clear() {
            this.table.tbody.innerHTML = '';
        }
        get selectedRows() {
            return [this.table.querySelector('.sp-track-selected')];
        }
        refresh() {
            this.dataSource.refresh();
        }
        async attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'uri') {
                if (newVal != null) {

                    await this.fetchNext();
                }
            }
            if (attrName === 'showheaders') {
                if (newVal == 'true') {
                    if (this.table.tfoot != null) {
                        this.table.removeChild(this.table.tfoot);
                        this.table.tfoot = null;
                    }
                }
            }
        }
        isRowWithIndexSelected(index) {
            try {
                return this.selectedIndicies.filter(tr => tr.getAttribute('data-index')).length > 0;
            } catch (e) {
                return false;
            }
        }
        reorderRows(indicies, newPosition, addToHistory=true) {
            if (addToHistory)
             this.history.push(
                this.state.object.objects.slice(0)
            );
            var affectedObjects = [];
            var oldPositions = [];
            var newPositions = [];
            indicies.map((index, i) => {
                this.state.object.objects.move(index, newPosition);
                oldPositions.push(index);
                this.state.object.objects[newPosition].position = newPosition;
                newPositions.push(newPosition);

                var obj = this.state.object.objects[newPosition];
                affectedObjects.push(obj);
                obj.invalidated = true;

            })
            this.render();

            this.dataSource.replaceObjects(this.state.object.objects, this.uri);
        }
        doAction(objs, future=true) {
            if (!objs) return;
            for (let obj of objs) {
                if (obj.action == 'insert') {
                   this.insertObjectsAt(obj.objects, obj.position, this.uri, future);
                }
                if (obj.action == 'remove') {
                    this.removeObjects([obj.position], this.uri, future);
                }
                if (obj.action == 'reorder') {
                    this.reorderRows(obj.indicies, obj.newPosition, this.uri, future);
                }
            }
        }
        insertObjectsAt(objects, position, addToHistory=true, save=true) {
            this.history.push(
               this.state.object.objects.slice(0)
            );
            this.state.object.objects = this.state.object.objects.insertArray(objects, position);
            this.validatePositions();

            this.render();
            if (save) {
                //  this.dataSource.insertObjectsAt(objects, position, this.uri);
                this.dataSource.replaceObjects(this.state.object.objects, this.uri);
            }

        }
        validatePositions() {
            this.state.object.objects = this.state.object.objects.map((o, i) => {
                if (!o) return null;
                o.position = i;
                return o;
            });
        }
        deleteRowsAt(indicies, addToHistory=true) {
            this.state.object.objects = this.state.object.objects.filter(
                (o, i) => {
                    return !indicies.contains(i);
                }
            );
            this.dataSource.replaceObjects(this.state.object.objects, this.uri);
            this.render();
        }
        get canReorderRows() {
            return this.hasAttribute('canreorderrows')
        }

        set canReorderRows(value) {

            this.setAttribute('canreorderrows', value == true);
            if (!value) {
                this.removeAttribute('canreorderrows');
            }
        }
        get canAddRows() {
            return this.hasAttribute('canaddrows')
        }
        set canAddRows(value) {

            this.setAttribute('canaddrows', value == true);
            if (!value) {
                this.removeAttribute('canaddrows');
            }
        }
        get canDeleteRows() {
            return this.hasAttribute('candeleterows')
        }
        set canDeleteRows(value) {

            this.setAttribute('candeleterows', value == true);
            if (!value) {
                this.removeAttribute('candeleterows');
            }
        }
        undo() {
            this.future.push(this.state.object.objects.slice(0));
            this.state.object.objects = this.history.pop();
            this.render();
        }
        redo() {
            this.history.push(this.state.object.objects.slice(0));
            this.state.object.objects = this.future.pop();
            this.render();
        }
        render() {
            this.innerHTML = ''
            this.table = document.createElement('table');
            this.table.thead = document.createElement('thead');
            this.table.thead.tr = document.createElement('tr');
            this.table.thead.appendChild(this.table.thead.tr);
            this.table.appendChild(this.table.thead);
            this.table.tbody = document.createElement('tbody');
            this.table.appendChild(this.table.tbody);
            this.appendChild(this.table);

            this.table.thead.innerHTML = '';
            this.table.thead.tr = document.createElement('tr');
            if(this.getAttribute('showcolumnheaders') === 'true')
                this.table.thead.appendChild(this.table.thead.tr);

            if (this.canReorderRows || this.canAddRows) {
                $(this, 'td').on('dragover', false);
                $(this, 'td').on('drop', (ex) => {
                    ex.preventDefault();
                    if (this.dropping) return;
                    this.dropping = true;
                    let e = ex.originalEvent;
                    $('tr').removeClass('sp-dragover');
                    if (this.canReorderRows || this.canAddRows) {
                        if (e.dataTransfer.effectAllowed == 'move') {

                            this.dropping = false;
                            this.reorderRows(this.selectedIndicies, this.insertPosition);
                        //    this.refresh();
                        try {
                        this.selectedRows.map(tr => {

                            this.table.tbody.removeChild(tr);
                        });
                        this.selectedTrs.map(tr => {
                            this.table.tbody.insertBefore(tr, this.table.tbody.childNodes[this.insertPosition])
                        });
                        } catch (e) {

                        }
                        }
                    }
                });
            }
            if (this.dataSource && this.dataSource.removedRows instanceof Array)
                for (let row of this.dataSource.removedRows) {
                    let tr = this.table.tbody.querySelector('td[data-id="' + row.id + '"]');
                    this.table.tbody.removeChild(tr);
                }

            function getFieldValue(key, obj) {
                if (typeof(obj[key]) === 'string' ) {
                    return obj[key];
                } else if (!isNaN(obj[key])) {
                    return obj[key];
                } else if (obj[key] instanceof Array) {
                    return obj[key].map(o => o instanceof Object ? o.name : typeof(o) === 'string' ? o : o).join(', ')
                } else if (obj[key] instanceof Object) {
                    return obj[key].name
                }
            }
            let objects = this.state.object.objects.slice(0);
            if (typeof(this._sortBy) === 'string') {
                objects = objects.sort((a, b) => {
                    let field = this._sortBy;
                    let positive = true;
                    if (field.indexOf('-') === 0) {
                        positive = false;
                    }
                    field = field.replace(/-/, '');
                    let val1 = getFieldValue(field, a);
                    let val2 = getFieldValue(field, b);
                    if (typeof(val1) === 'string') {
                        return positive ? ("" + val1).localeCompare('' + val2) : ("" + val2).localeCompare('' + val1);

                    } else if (!isNaN(val1)) {
                        return positive ? (val1 - val2) : val2 - val1;
                    } else {
                        return 0;
                    }
                });
            }
            if (this.state.object && objects instanceof Array)
            for (let i = 0; i < objects.length; i++) {
                let row = objects[i];
                let tr = this.designer.getRowElement(row);
                if (!tr.hasAttribute('data-index')) {
                    tr.setAttribute('data-index', i);
                }
                tr.setAttribute('draggable', true);
                tr.addEventListener('dragstart', (e) => {

                    this.selectedTrs = this.selectedRows;
                    this.selectedIndicies = this.selectedRows.map(
                        (tr) => parseInt(tr.getAttribute('data-position'))
                    );
                    this.selectedUris = this.selectedRows.map(
                        (tr) => tr.getAttribute('data-uri')
                    );
                    let text = this.selectedUris.join("\n");
                    event.dataTransfer.setData("text/plain",text);
                    try {
                        let dragElement = document.createElement('sp-dragelement');
                        dragElement.innerHTML = row.name;
                        document.body.appendChild(dragElement);
                        event.dataTransfer.setDragImage(dragElement, 0, 0);
                    } catch (e) {
                        console.log(e);
                    }
                    if (this.canReorderRows) {
                        e.dataTransfer.effectAllowed = 'move';

                        this.activity = 'reorder';
                    }
                })
                if (this.canReorderRows || this.canAddRows) {
                    tr.addEventListener('dragenter', (e) => {
                        if (e.dataTransfer.effectAllowed == 'move') {
                            $('tr').removeClass('sp-dragover');
                            $(tr).addClass('sp-dragover');
                            this.insertPosition = $(tr).attr('data-position');
                        }
                    })
                    tr.addEventListener('dragleave', (e) => {
                        if (e.dataTransfer.effectAllowed in ['move', 'insert']) {
                            $('tr').removeClass('sp-dragover');
                            $(tr).addClass('sp-dragover');
                        }
                    })

                }
                tr.addEventListener('dblclick', (e) => {
                    if (this.delegate != null) {
                        let ptr = getParentElementByTagName(e.target, 'TR');
                        if (!!ptr) {
                            this.delegate.onRowDoubleClick(ptr, row);
                        }
                    }
                });
                tr.addEventListener('click', (e) => {
                    if (this.delegate != null) {
                        let ptr = getParentElementByTagName(e.target, 'TR');
                        if (this.delegate.onRowClick instanceof Function)
                        this.delegate.onRowClick(ptr, row);

                    }
                });
                tr.setAttribute('data-context-uri', this.uri);
                for (let j = 0; j < this.columnheaders.length; j++) {
                    let td = this.designer.getCellElement(j, row);
                    if (!td) continue;
                    tr.appendChild(td);
                    tr.dataset.index = i;
                    if (!tr.hasAttribute('data-index')) {
                        tr.setAttribute('data-index', j);
                    }
                    td.addEventListener('mousedown', (e) => {
                        let selectedIndicies = this.selectedIndicies || [];
                        let selectedIndex = e.target.parentNode.dataset.index;
                        if (this.cntrlIsPressed) {
                            if (this.isRowWithIndexSelected(selectedIndex)) {
                                this.selectedIndicies.splice(this.selectedIndicies.indexOf(selectedIndex), 1);
                            } else {
                                this.selectedIndicies.push(selectedIndex);
                            }
                        } else {
                            this.selectedIndicies = [e.target.parentNode.dataset.index];
                        }
                    })
                }
                let offset = 0;
                let children = row.objects;
                if (tr.created) {
                    this.table.tbody.insertBefore(tr, this.table.tbody.children[i + offset]);
                    tr.created = false;
                }
                if (row.objects instanceof Array)
                for (let c = 0; c < row.objects.length; c++) {
                    let child = row.objects[c];
                    let tr2 = this.designer.getRowElement(child);
                    tr2.setAttribute('data-parent-id', row.id);
                    tr2.setAttribute('data-parent-index', i);
                    tr2.setAttribute('data-context-uri', this.uri);
                    tr2.addEventListener('click', (e) => {
                        if (this.delegate != null) {
                            let ptr = e.target;
                            while (ptr.tagName !== 'TR') {
                                ptr = ptr.parentNode;
                            }
                            this.delegate.rowDoubleClick(child, ptr);

                        }
                    });
                    for (let j = 0; j < this.columnheaders.length; j++) {
                        let td = this.designer.getCellElement(j, child);
                        tr2.appendChild(td);
                        tr2.dataset.index = i;
                        td.addEventListener('mousedown', (e) => {
                            this.selectedIndicies = [e.target.parentNode.dataset.index];
                        })

                    }

                }
                if (children instanceof Array)
                offset += children.length;

                if (i == objects.length - 1 && !!this.header) {
                    let rect = tr.getBoundingClientRect();
                    let top = ((i % 2 == 0 ? rect.height : 0) + (this.header.getBoundingClientRect().top) + this.table.thead.getBoundingClientRect().height);
                    this.view.style.backgroundPosition = "0pt " + top + 'pt';
                }

            }
            if (this.columnheaders && this.designer)
            for (let j = 0; j < this.columnheaders.length; j++) {
                let th = this.designer.getColumnElementAt(j);
                    let field = th.dataset.field;
                th.addEventListener('click', (e) => {
                    let field = e.target.dataset.field;
                    if (this.sortBy === field) {
                        this.sortBy = '-' + this.sortBy
                    } else if (this.sortBy === '-' + field) {
                        this.sortBy = null;
                    } else {
                        this.sortBy = field;
                    }

                })
                if (this.sortBy && this.sortBy.indexOf(field) !== -1) {
                    if (this.sortBy.indexOf('-') === 0) {
                        th.classList.add('sort-descending');
                        th.classList.remove('sort-ascending');
                    } else {
                        th.classList.remove('sort-descending');
                        th.classList.add('sort-ascending');
                    }

                } else {
                    th.classList.remove('th-sort-descending');
                    th.classList.remove('th-sort-ascending');
                }
                this.table.thead.tr.appendChild(th);
            }
            if (this.emptyLabel)
            if (this.state.object && objects.length > 0)
            if (objects.length < 1) {
                this.emptyLabel.setAttribute('hidden', true);
            } else {
            this.emptyLabel.style.left = (this.getBoundingClientRect().width) + 'px';
            this.emptyLabel.style.top = '300pt';
                if (this.emptyLabel.hasAttribute('hidden')) {
                    this.emptyLabel.removeAttribute('hidden');
                }

            }

            if (this.getAttribute('showcolumnheaders') === 'true' || this.getAttribute('zebra') === 'true') {
                if (this.table.tfoot) {
                    try {
                        this.table.removeChild(this.table.tfoot);
                    } catch (e) {

                    }
                }
                this.table.tfoot = document.createElement('tfoot');
                this.table.tfoot.tr = document.createElement('tr');
                this.table.tfoot.tr.td = document.createElement('td');
                this.table.tfoot.tr.td.setAttribute('colspan', (this.columnheaders.length));
                this.table.tfoot.tr.td.classList.add('zebra');
                this.table.appendChild(this.table.tfoot);
                this.table.tfoot.appendChild(this.table.tfoot.tr);
                this.table.tfoot.tr.appendChild(this.table.tfoot.tr.td);
                this.adjustZebra();
            } else {
                try {
                if (this.table.tfoot) {
                    this.table.removeChild(this.table.tfoot);
                }
                } catch (e) {

                }
            }
            if (!this.getAttribute('showcolumnheaders')) {
                this.table.thead.setAttribute('hidden', 'true');

            } else {
                if (this.table.thead.hasAttribute('hidden'))
                this.table.thead.removeAttribute('hidden');

            }

            let evt = new CustomEvent('rendered');
            if (!this.gondole) {
                this.gondole = document.createElement('tr');
                this.table.tbody.appendChild(this.gondole);
                this.gondole.innerHTML = '<tr height="1pt"><td style="text-align: center" colspan="' + (this.columnheaders.length - 2) + '"></td></tr>';
            /*   this.gondole.querySelector('button').addEventListener('click', () => {
                this.fetchNext();
                });*/
            } else {
                this.gondole.parentNode.removeChild(this.gondole);
                this.table.tbody.appendChild(this.gondole);
            }
            this.checkNext();
            this.dispatchEvent(evt);

            this.adjustZebra();
            if (this.uri != null && this.initial && typeof(this._sortBy) === 'string') {
                this.fetchNext()
                this.initial = false
            }
        }
        resize() {
            this.adjustZebra();
        }
        adjustZebra() {
            if (!this.table.tfoot) return;
            let thBounds = {top: 0, height: 0};
            let th = this.querySelector('th');
            let thead = this.querySelector('thead');
            if (thead && thead.hasAttribute('hidden')) return;
            if (th) thBounds = th.getBoundingClientRect();
            let view = getParentElementByClass(this, "sp-view");
            if (!view) return;
            try {
                let bounds = view.getBoundingClientRect();
                let lastTd = this.querySelector('tr:last-child td');
                let height = bounds.bottom - thBounds.height;
                if (!!lastTd) {
                    let lastBounds = lastTd.getBoundingClientRect();

                    height -= lastBounds.top + lastBounds.height;
                }
                if (this.table.tfoot != null)
                {
                    this.table.tfoot.tr.td.style.height = (height) + 'px';
                    let numRows = this.getElementsByTagName("tr").length;
                    if ((numRows % 2) != 0)
                        this.table.tfoot.tr.td.style.backgroundPosition = '0pt ' + lastTd.getBoundingClientRect().height + 'px';

                }
            } catch (e) {
            }
        }
        attachedCallback() {

            let thead = this.querySelector('thead');
            if (thead != null)
            if (thead.hasAttribute('hidden')) {
                this.adjustZebra();
            }
            this.checkNext();
        }
    };
    export default SPTableElement
