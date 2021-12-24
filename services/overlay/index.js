var fs = require('fs');
var express = require('express');
const Cache = require('../cache');

var cache = new Cache()

function readJSONSync(path) {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'))
  }
  return {}
}

class OverlayService {
  resolveOverlay(uri, cb) {
    let overlays = readJSONSync(__dirname + '/overlays.json');
    let overlay = overlays[uri];
    if (!overlay) {
      overlay = {}
    }
    cb(null, overlay);
  }
  createServer() {
    var app = express();
    app.timeout = .1;
    app.use(function (err, req, res, next) {
      console.error(err.stack)
      res.status(500).send('Something broke!')
    })
    app.get('/', (req, res) => {
      var uri = req.query.uri;
      this.resolveOverlay(uri, function (err, result) {
        if (err) {
          res.status(500).send({error: true});
          return;
        }
        res.json(result).end();
      })
    });
    return app;

  }
}
var service = {
  id: 'overlay',
  uri: 'service:overlay',
  type: 'service',
  name: 'Overlay',
  description: 'Overlay service'
};

module.exports = OverlayService
