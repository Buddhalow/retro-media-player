import store from '@/plugins/media/store.js'

import SPTableDelegate from '@/controls/tabledelegate.js';

export default class SPTrackTableDelegate extends SPTableDelegate {
    onItemDblClick(tr) {
        let id = tr.getAttribute('data-uri');
    }
}
