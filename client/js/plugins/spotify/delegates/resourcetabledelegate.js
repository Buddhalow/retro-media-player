import SPTableDelegate from '/js/controls/tabledelegate.js';

export default class SPResourceTableDelegate extends SPTableDelegate {
    onRowDoubleClick(tr) {
        let uri = tr.getAttribute('data-uri');
        GlobalViewStack.navigate(uri);
    }
}
