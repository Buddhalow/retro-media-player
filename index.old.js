var express = require('express');
var execPath = process.env.PWD;
var fs = require('fs');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var apiFactory = require('./api.js');
var app = express();
var appFinder = require('./appfinder')
var bodyParser = require('body-parser');
  app.use(bodyParser());
//var busy = require('busy');
var server = require('http').createServer(app);

var favicon = require('serve-favicon')
var api = apiFactory(server);

 
var nodeadmin = require('nodeadmin');
app.use(nodeadmin(app));
app.maxConnections = 200;
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
app.timeout = 1000;
app.use(cookieParser());
app.use(cookieSession({
    secret:'32425235235235',
    name: 'session',
    keys: ['key1', 'key2'],
    cookie: {secure: false}
}));


var path = require('path');

/*
// middleware which blocks requests when we're too busy
app.use(function(req, res, next) {
    if (busyCheck.blocked) {
        res.send(503, "I'm busy right now, sorry.");
    } else {
        next();
    }
});*/
app.use('/api', api.app);
/*
var busyCheck = busy(function(amount) {
    console.log('Loop was busy for', amount, 'ms');
});*/

app.use(express.static(__dirname + '/client/'));

app.get('/callback.html', function (req, res) {
    var index = fs.readFileSync(__dirname + '/client/callback.html');
    res.write(index);
    res.end();
});

app.get('/callback/:service', function (req, res) {
    var index = fs.readFileSync(__dirname + '/client/callback.html');
    res.write(index);
    res.end();
});
app.use(favicon(path.join(__dirname, 'client', 'favicon.ico')))
app.get('/*', function (req, res) {
    try {    var protocol = req.connection.encrypted ? 'https' : 'http';
        if (req.host.indexOf('roamnia-drsounds.c9users.io') != -1) {
            protocol = 'https';
        }
        var index = fs.readFileSync(__dirname + '/client/index.html', 'utf8');
    
        //index = index.replace('https://roamnia-drsounds.c9users.io',  protocol + '://' + req.host + ':' + (process.env.PORT || 9261) + '');
        //console.log(index);
        res.write(index);
        res.end();
    } catch (e) {
        throw e
        res.send('error')
    }
});

app.get('/', function (req, res) {
    try {
        var protocol = req.connection.encrypted ? 'https' : 'http';
        if (req.host.indexOf('romnia-drsounds.c9users.io') != -1) {
            protocol = 'https';
        }
        var index = fs.readFileSync(__dirname + '/client/index.html', 'utf8');
    
        index = index.replace('https://roamnia-drsounds.c9users.io',  protocol + '://' + req.host + ':' + (process.env.PORT || 9261) + '');
        console.log(index);
        res.write(index);
        res.end();
    } catch (e) {
        res.write('error').end()
    }
});
module.exports = app;
if (typeof require != 'undefined' && require.main==module) {
    app.listen(process.env.PORT || 2858);
}


