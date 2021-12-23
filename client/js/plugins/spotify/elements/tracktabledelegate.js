import store from '/js/plugins/spotify/player.js'

export default class SPTrackTableDelegate {
    onRowClick(tr, row) {
        let uri = row.uri.replace(/chapter/, 'track')
        let isMobile = window.matchMedia('screen and (max-width: 720pt)').matches;
        if (isMobile) {
            store.playTrack({
                uri: uri,
                ...row
            }, tr.getAttribute('data-context-uri'));
        }
    }
    onRowDoubleClick(tr, row) {
        let uri = row.uri.replace(/chapter/, 'track')

        if (window.infectedResources.indexOf(uri) != -1) {
            alert('The track is infected with bad energy and has been blocked from streaming');
            return
        }
        let isMobile = window.matchMedia('screen and (max-width: 720pt)').matches;
        if (!isMobile) {
            store.playTrack({
                uri: uri,
                ...row
            }, tr.getAttribute('data-context-uri'));
        }
    }
}