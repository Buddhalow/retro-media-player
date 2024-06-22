var express = require('express');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session'); 
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser());

var http = require('http')

var favicon = require('serve-favicon')
var api = apiFactory(http);
app.maxConnections = 200;
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
app.use(cookieParser());
app.use(cookieSession({
    secret:'32425235235235',
    name: 'session',
    keys: ['key1', 'key2'],
    cookie: {secure: false}
}));


var path = require('path');

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
  var index = fs.readFileSync(__dirname + '/client/index.html', 'utf8');
  res.write(index);
  res.end();
});

app.get('/', function (req, res) {
  try {
    var index = fs.readFileSync(__dirname + '/client/index.html', 'utf8');
    res.write(index);
    res.end();
  } catch (e) {
    res.write('error').end()
  }
});
module.exports = app;

const server = http.createServer(app)

console.log("Listening to 3001")

server.listen(process.env.PORT || 3001)
