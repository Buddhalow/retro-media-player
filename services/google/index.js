var fs = require( 'fs');
var request = require('request');
var os = require('os');
var md5 = require('md5');
var Cache = require('../cache');
var express = require('express')

var cache = new Cache()
class Google {
    constructor(apikeys) {
        
        this.apikeys = apikeys
    }

    search(q, site, fields, cx, exclude, offset) {
        var self = this;
        return new Promise((resolve, reject) => {
            var url = 'https://www.googleapis.com/customsearch/v1?key=' + self.apikeys.client_id + '&fields=' + fields + '&cx=' + cx + '&q=' + encodeURI(q) + '&siteSearch=' + site + '&siteFilter=i&start=' + (offset + 1) + '&excludeTerms=' + encodeURI(exclude);
            
            if (cache.isCached(url)) {
                var result = cache.load(url);
                resolve(result);
                return;
            } 
            request({
                url 
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                    return;
                };
                var result = JSON.parse(body);
                if (!('items' in result)) {
                    result.items = []; 
                }
                result.service = {
                    id: 'google',
                    name: 'Google',
                    type: 'google',
                    uri: 'bungalow:service:google'
                };
                cache.save(url, result);
                resolve(result);
            });
        });
    }
    createServer() {
        return express()
    }
}

module.exports = Google