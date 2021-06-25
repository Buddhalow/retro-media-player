
export default class SPSidebarElement extends HTMLElement {
     connectedCallback() {
        
        this.tabBar = document.createElement('sp-tabbar');

        this.tabBar.innerHTML = '&nbsp;';
        this.tabBar.style.height = '16pt';
        this.appendChild(this.tabBar);
        this.menu = document.createElement('sp-sidebarmenu');
        this.appendChild(this.menu);
        this.nowplaying = document.createElement('sp-nowplaying');
        this.appendChild(this.nowplaying);
    }
}
