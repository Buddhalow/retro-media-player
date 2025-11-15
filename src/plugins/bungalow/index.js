import SPMenuDataSource from '@/controls/menudatasource.js';

document.addEventListener('mainmenuload', (e) => {
    let menu = document.createElement('sp-menu');
    let sidebarmenu = document.querySelector('sp-sidebarmenu');
    sidebarmenu.appendChild(menu);
    menu.dataSource = new SPMenuDataSource(
        [
            {
                name: 'Start',
                uri: 'bungalow:internal:start'
            }
        ]
    );
});