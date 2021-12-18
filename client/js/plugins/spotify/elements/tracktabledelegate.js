import store from '/js/plugins/spotify/player.js'

export default class SPTrackTableDelegate {
    onRowClick(tr, row) {
    }
    onRowDoubleClick(tr, row) {
        let uri = row.uri.replace(/chapter/, 'track')

        if (window.infectedResources.indexOf(uri) != -1) {
            alert('The track is infected with bad energy and has been blocked from streaming');
            return
        }
        store.playTrack({
            uri: uri,
            ...row
        }, tr.getAttribute('data-context-uri'));
    }
}