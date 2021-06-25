
export default class SPViewElement extends HTMLElement {
    static get observedAttributes() {
        return ['uri    ']
    }
    constructor() {
        super();
        this.scrollX = 0;
        this.scrollY = 0;
        this.extraTabs = []

    }
    createDefault() {
        this.classList.add('sp-view')
        this.container = document.createElement('div')
        this.container.classList.add('container')
        this.appendChild(this.container)

    }
    createDefaultWithHeader() {
        this.classList.add('sp-view')
        this.container = document.createElement('div')
        this.header = document.createElement('sp-header')
        this.container.classList.add('container')
        this.appendChild(this.container)

    }
    createTabContent(id) {
        let tabContent = document.createElement('sp-tabcontent');
        tabContent.setAttribute('data-tab-id', id);
        return tabContent;
    }
    createTableTabContent(id, designer, dataSource, delegate, uri) {
        let tabContent = this.createTabContent(id);
        let table = document.createElement('sp-table');
        table.designer = designer;
        table.datasource = dataSource;
        table.delegate = delegate;
        tabContent.table = table;
        tabContent.appendChild(table);
        table.view = this;
        if (!!uri) {
            table.setAttribute('uri', uri);
        }
        return tabContent;
    }
    addTab(id) {
        let tab = this.createTabContent(id);
        this.appendChild(tab);
        return tab;
    }
    addTableTab(id, designer, dataSource, delegate, uri) {
        let tab = this.createTableTabContent(id, designer, dataSource, delegate, uri);
        this.appendChild(tab);
        return tab;
    }
    acceptsUri(uri) {
        return false;
    }
    get uri() {
        return this.getAttribute('uri');
    }
    set uri(value) {
        this.setAttribute('uri', value);
    }
    setUri(value) {
        this.uri = value
    }
    get template() {
        return this.getAttribute('template')

    }
    set template(value) {
        this.setAttribute('template', value)
    }
    activate() {
        GlobalTabBar.setState({
            objects: [{
                id: 'overview',
                name: _e('Overview')
            }],
            object: this.state ? this.state.object : null
        })
        this.scrollTop = (this.scrollY);
        if (this.header) {
            if (this.header.vibrant instanceof Function)
            this.header.vibrant();
            this.header.activate()
            this.header.scroll()
        } else {
            document.querySelector('sp-floatingbar').style.backgroundColor = 'transparent'
        }
    }

    _onScroll(e) {
        let view = e.target;
        view.scrollY = view.scrollTop;
    }
    connectedCallback() {
        this.classList.add('sp-view');
        this.addEventListener('scroll', this._onScroll);
    }
    navigate(uri) {


    }
    disconnectedCallback() {
        this.removeEventListener('scroll', this._onScroll);
    }
    syncHooks(uri) {
        let hooks = this.querySelectorAll('sp-hook');
        for (let hook of hooks) {
            hook.setAttribute('uri', uri);
        }
    }
    invalidate() {

    }
    afterLoad(uri) {

        $('.addon').remove()
        var event = new CustomEvent('viewload', {detail: this});
        document.dispatchEvent(event);
    }
    refresh() {

    }
    addTab(tabId, name) {
        if (!this.extraTabs) {
            this.extraTabs = [];
        }
        if (this.extraTabs.filter(o => {

            return o.id === tabId
        }).length > 0) return
        this.extraTabs.push({
            id: tabId,
            name: name
        });
        let tab = document.createElement('sp-tabcontent');
        tab.setAttribute('data-tab-id', tabId);
        tab.setAttribute('data-label', name);
        tab.classList.add('addon')
        tab.style.display = 'none';
        this.appendChild(tab);
        this.activate()
        return tab;
    }
    addTabContent(tabId, name) {
        let tab = document.createElement('sp-tabcontent');
        tab.setAttribute('data-tab-id', tabId);
        tab.setAttribute('data-label', name);
        tab.style.display = 'none';
        tab.style.width = '100%'
        tab.style.height = '100%'
        this.container.appendChild(tab)
        return tab;
    }
    loadByTemplate() {
        this.innerHTML = ''
        this.spider = document.createElement('sp-spider')
        this.appendChild(this.spider)
        this.spider.template = this.template
        this.spider.uri = this.getAttribute('uri')
        this.spider.render()
    }
    attributeChangedCallback(attrName, oldValue, newVal) {
        if (attrName === 'uri') {

            if (this.template != null) {
                this.loadByTemplate(newVal)
            }
            this.syncHooks(newVal);
            this.afterLoad()
        }
    }
}
