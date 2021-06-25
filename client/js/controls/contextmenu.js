class SPContextMenuElement extends HTMLElement {
    connectedCallback() {
        if (!this.created) {
            this.created = new Date();

        }
            this.addEventListener('mouseup', (e) => {
              window.clearContextMenus();
        })
        this.addEventListener('mousedown', (e) => {
           e.stopPropagation();
        })
        let enterTimeout = null;
    }
    get object() {
        return this._object;
    }
    set object(value) {
        this._object = value;
    }
    get menuItems() {
        return this._menuItems;
    }
    set menuItems(value) {
        this._menuItems = value;
    }
    static show(pos, object, items) {

        let contextMenu = document.createElement('sp-contextmenu');
        contextMenu.object = object;
        contextMenu.setMenuItems(items);
        contextMenu.style.left = (pos.x + 2) + 'px';
        contextMenu.style.top = (pos.y + 2) + 'px';
        document.body.appendChild(contextMenu);
        $(contextMenu).fadeIn();

    }
    hide() {
        $(this).fadeOut();
    }
    render() {
        this.innerHTML = '';
        for (let item of this.menuItems) {
            let element = 'sp-contextmenuitem';
            if ('element' in item) {
                element = item.element;
            }
            let menuItem = document.createElement(element);
            menuItem.innerHTML = item.label;
            menuItem.object = this.object;
            menuItem.item = item;

            menuItem.render();
            this.appendChild(menuItem);

        }
    }
    setMenuItems(menuItems) {
        this.menuItems = menuItems;
        this.render();
    }
}

export default SPContextMenuElement;