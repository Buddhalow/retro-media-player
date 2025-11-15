var express = require('express');
var fs = require('fs'); 
var app = express(); 
 
var http = require('http')

var favicon = require('serve-favicon')
app.maxConnections = 200;  
var path = require('path');
 
app.use(express.static(__dirname + '/src/'));


const privateKey = fs.readFileSync("AuthKey.p8").toString();
const teamId     = "ABCDE12345";
const keyId      = "ABCDE12345";

const jwtToken = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: teamId,
  header: {
    alg: "ES256",
    kid: keyId
  }
});

console.log(jwtToken);
view raw

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

const port = process.env.PORT || 3001

console.log("Listening on " + port)

server.listen()
