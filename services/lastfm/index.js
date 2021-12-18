var assign = require('object-assign');
var fs = require('fs');
var os = require('os');
var request = require('request');
var cookieParser = require('cookie-parser');
var md5 = require('md5');
var LastfmAPI = require('lastfmapi');
var qs = require('querystring');
var express = require('express')
  
class LastFMService {
    constructor(apikeys) {
        this.apikeys = apikeys
        this.lastFM = new LastfmAPI({
            'api_key': this.apikeys.client_id,
            'secret': this.apikeys.client_secret
        });
    }

    _request(method, method2, qs) {
        return new Promise(function (resolve, reject) {
            request({
                method,
                url: 'http://ws.audioscrobbler.com/2.0/',
                query: assign({
                    api_key: this.apikeys.api_key,
                    format: 'json',
                    method: method2
                }, qs)
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    var result = JSON.parse(body);
                    resolve(result);
                } catch (e) {
                    reject(500);
                }
            })
        });
    }

    getArtistByName(id) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.lastFM.artist.getInfo({
                artist: id
            }, (err, artist) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    bio: {
                        description: artist.bio.summary,
                        body: artist.bio.content,
                        time: artist.bio.published
                    },
                    tags: artist.tags.tag.map(t => t.name),
                    description: artist.bio.summary,
                    listeners: {
                        count: artist.stats.listeners
                    },
                    plays: {
                        count: artist.stats.plays
                    },
                    name:artist.name,
                    
                })
            })
        });
    }

    getLoginUrl() {
        return this.lastFM.getAuthenticationUrl({cb: 'https://roamnia-drsounds.c9users.io/callback.html'});
    }

    authenticate(req, resolve) {
        var self = this;
        this.req = req;
        console.log(req);
        console.log("Ta");
        this.lastFM.authenticate(req.query.code, (err, result) => {
            try {
                var session = {
                    access_token: result.key,
                    name: result.name,
                    user: {
                        id: result.name,
                        username: result.name,
                        name: result.name
                    },
                    issued: new Date().getTime(),
                    expires_in: new Date(2099, 1, 1)
                }
                resolve(null, session);
            } catch (e) {
                resolve(e);
            }
        })
    }
    createServer() {
        let service = this
        var app = express();


        app.use(cookieParser());


        app.use((req, res, next) => {
            service.req = req;
            service.res = res;
        var session = req.cookies['lastfm'];
            if (!!session) {
                try {
                service.session = JSON.parse(session);
                service.lastFM.setSessionCredentials(service.session.user, service.session.access_token);
                } catch (e) {
                    
                }
            }
            next();
        });


        app.get('/login', (req, res) => {
            res.redirect(service.getLoginUrl());
        });


        app.get('/authenticate', (req, res) => {
            console.log("Got authenticate request");
            console.log(req);
            service.authenticate(req, (err, session) => {
                if (err != null) {
                    res.status(err).send({error: err});
                    res.send();
                }
                console.log("success");
                res.clearCookie('lastfm');
                var strSession = JSON.stringify(session);
                res.cookie('lastfm', strSession);
                res.statusCode = 200;
                res.json(session);
                res.send();
            });
        });


        app.get('/login', (req, res) => {
            res.redirect(service.getLoginUrl());
        });


        app.get('/artist/:identifier', (req, res) => {
            service.getArtistByName(req.params.identifier).then(result => {
                res.json(result).send();
            }, err => {
                res.status(500).json(err).send();
            })
        });
    }
}



module.exports = LastFMService