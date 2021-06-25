import SPMenuDataSource from '/js/controls/menudatasource.js';

document.addEventListener('mainmenuload', (e) => {
    let menu = document.createElement('sp-menu');
    let sidebarmenu = document.querySelector('sp-sidebarmenu');
    sidebarmenu.appendChild(menu);
    menu.dataSource = new SPMenuDataSource(
        [
            {
                name: _e('Start'),
                uri: 'bungalow:internal:start'
            },
            {
                name: _e('Settings'),
                uri: 'bungalow:config'
            },
            {
                name: _e('Services'),
                uri: 'bungalow:service'
            },
            {
                name: _e('Plugins'),
                uri: 'bungalow:plugin'
            }
        ]
    );
});