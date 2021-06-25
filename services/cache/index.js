var os = require('os');
var fs = require('fs');
var md5 = require('md5');
var tmp = require('tmp');
var path = require('path');

function getFileName(uri) {
    return path.join(md5(uri) + '.json')
}


function getFilePath(uri) {
    return path.join(os.tmpdir(), getFileName(uri));
}


class Cache {
    save(uri, contents) {
        var filePath = getFilePath(uri);
        fs.writeFileSync(filePath, JSON.stringify(contents));
    }

    invalidate(uri) {
        var filePath = getFilePath(uri);
        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);
    }

    load(uri) {
        var filePath = path.join(os.tmpdir(), getFileName(uri));
        return JSON.parse(fs.readFileSync(filePath));
    }

    isCached(uri) {
        return fs.existsSync(getFilePath(uri));
    }
}


module.exports = Cache;