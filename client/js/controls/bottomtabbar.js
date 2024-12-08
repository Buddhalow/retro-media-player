export default class SPBottomTabBarElement extends HTMLElement {
    connectedCallback() {
        this.render();
    }
    render() {
        this.innerHTML = `
            <sp-link uri="spotify:internal:start">
                <div style="display: flex; flex-direction: column; gap: 3pt; align-items: center">
                    <i class="fa fa-home"></i>
                    <span>Start</span>
                </div>
            </sp-link>
            <sp-link uri="spotify:search:search">
                <div style="display: flex; flex-direction: column; gap: 3pt; align-items: center">
                    <i class="fa fa-search"></i>
                    <span>Search</span>
                </div>
            </sp-link>
            <sp-link uri="spotify:library">
                <div style="display: flex; flex-direction: column; gap: 3pt; align-items: center">
                    <i class="fa fa-book"></i>
                    <span>Start</span>
                </div>
            </sp-link>
            <sp-link uri="bungalow:config">
                <div style="display: flex; flex-direction: column; gap: 3pt; align-items: center">
                    <i class="fa fa-cog"></i>
                    <span>Account</span>
                </div>
            </sp-link>
        `;
    }
}