import store from '/js/plugins/spotify/player.js'

export default class SPTrackTableDelegate {
    onRowClick(tr, row) {
    }
    onRowDoubleClick(tr, row) {
        let uri = row.uri.replace(/chapter/, 'track')
        tr.classList.add('sp-track-loading');
        store.playTrack({
            uri: uri,
            ...row
        }, tr.getAttribute('data-context-uri'));
    }
}