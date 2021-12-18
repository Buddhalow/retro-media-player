import SPTableDelegate from '/js/controls/tabledelegate.js';

export default class SPRestTableDelegate extends SPTableDelegate {
    onRowDoubleClick(tr, item) {
        let uri = tr.getAttribute('data-uri');

        GlobalViewStack.navigate(item.uri);
    }
}
