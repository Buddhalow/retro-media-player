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
            }
        ]
    );
});