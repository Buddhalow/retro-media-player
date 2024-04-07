var path = require('path');
var fs = require('fs');
var request = require('request');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var express =require('express');
var app = express();
var ogs = require('open-graph-scraper');

var AppFinder = require('./appfinder');
var appFinder = new AppFinder(); 

let credentials = {
  spotify: {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI
  },
  lastfm: {}
}

var app = express();

module.exports = function (server) {
  app.get('/lookup', function (req, res) {
    var uri = req.query.uri;
    ogs({
      url: uri
    }, function (err, results) {
      if (err) {
        res.status(500).json(err).end();
      }
      var data = results.data;
      var object = {
        slug: '',
        name: data.ogTitle,
        type: data.ogType,
        url: data.ogUrl,
        uri: data.ogUrl,
      
        image_url: data.ogImage.url,
        images: [{
          url: data.ogImage
        }],
        description: data.ogDescription
      };
      res.json(object).end();
    })
    
  });

  app.get('/app', function (req, res) {
   let apps = appFinder.getApps();
   res.json({
     objects: apps
   });
  })


  app.get('/theme', function (req, res) {
    var dirs = fs.readdirSync(__dirname + path.sep + 'client' + path.sep + 'themes');
    var apps = []
    dirs.forEach(function (appId) {
      if (appId.indexOf('.') == 0) return
      var manifest = JSON.parse(fs.readFileSync(__dirname + path.sep + 'client' + path.sep + 'themes' + path.sep + appId + path.sep + 'manifest.json'));
      apps.push(manifest);
    });
    res.json({
      objects: apps
    });
  })


  app.get('/plugin', function (req, res) {
    var dirs = fs.readdirSync(__dirname + path.sep + 'client' + path.sep + 'js' + path.sep + 'plugins');
    var apps = []
    dirs.forEach(function (appId) {
      if (appId.indexOf('.') == 0) return
      var manifest = JSON.parse(fs.readFileSync(__dirname + path.sep + 'client' + path.sep + 'js' + path.sep + 'plugins' + path.sep + appId + path.sep + 'manifest.json'));
      apps.push(manifest);
    });
    res.json({
      objects: apps
    });
  })

  function getBackendServices() {
      var dirs = fs.readdirSync(__dirname + path.sep + 'services');
    var apps = []
    dirs.forEach(function (appId) {
      console.log(appId);
      var manifest = JSON.parse(fs.readFileSync(__dirname + path.sep + 'services' + path.sep + appId + path.sep + 'package.json'));
      try {
      if ('bungalow' in manifest)
        apps.push(manifest.bungalow);
      } catch (e) {
        console.log(e.stack);
      }
    });
    return (apps);
  }

  function getFrontendServices() {
    const servicesDirPath = __dirname + path.sep + 'client' + path.sep + 'js' + path.sep + 'services'
    console.log(servicesDirPath)
    var dirs = fs.readdirSync(servicesDirPath);
    var apps = []
    dirs.forEach(function (appId) {
      console.log(appId);
      try {
        var manifest = JSON.parse(fs.readFileSync(servicesDirPath + path.sep + appId + path.sep + 'manifest.json'));
        apps.push(manifest);
      } catch (e) {
        console.log(e.stack);
      }
    });
    return (apps);
  }

  app.get('/service', function (req, res) {
    res.json({
        objects: getFrontendServices()
    })
  });

  var services = getBackendServices();

  // Load Services
  services.map(function (serviceInfo) {
      console.log(serviceInfo.id);
      console.log(serviceInfo);
      var ServiceClass = require(__dirname + path.sep + 'services' + path.sep + serviceInfo.id + path.sep + 'index.js');
      console.log(ServiceClass)
     if (ServiceClass) {
        let service = new ServiceClass(credentials[serviceInfo.id])
        let router = service.createServer()
        console.log(router)
        if (!!router) {
          app.use('/' + serviceInfo.id, router);
        }
      }
    
  })


  app.use(cookieParser());
  app.use(cookieSession({
      secret:'32425235235235',
      name: 'session',
      keys: ['key1', 'key2'],
      cookie: {secure: false}
  }));
  
  return {
      app: app
  }
}