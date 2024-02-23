const path = require('path')
const url = require('url')
const fs = require('fs')
const os = require('os')
const http = require('http')
const express = require('express')

let homedir = os.homedir()
let bungalowdir = homedir + '/.bungalow'
if (!fs.existsSync(bungalowdir)) {
  fs.mkdirSync(bungalowdir)
}
let installedappsdir = homedir + '/.bungalow/apps'

if (!fs.existsSync(installedappsdir)) {
  fs.mkdirSync(installedappsdir)
}

let developmentdir = homedir + '/Bungalow'

module.exports = class AppFinder {
    constructor() {
        
    }
    createServer() {
        let server = express()
        server.get('/*', function () {

            let paths = [`${homedir}/Bungalow/${url}`, `${homedir}/.bungalow/Apps/${url}`, `${__dirname}/client/apps/${url}`];
                let path = paths.filter(p => fs.existsSync(p))[0]
                console.log(path)
                res.sendFile(path)
            }, (error) => {
            res.json().send()
        })
        return server
    }
    getApps () {
        let objects = [];
        let apps = fs.readdirSync('./client/apps')
        for (let app of apps) {
            if (app.indexOf('.') === 0) continue
            let fullName = './client/apps/' + app + '/manifest.json'
            if (!fs.existsSync(fullName)) continue
            let manifest = JSON.parse(fs.readFileSync(fullName, 'utf8'))
            objects.push(manifest)
        } 
        apps = fs.readdirSync(installedappsdir);
        for (let app of apps) {
            if (app.indexOf('.') === 0) continue
            let fullName = installedappsdir + '/' + app + '/manifest.json'
            if (!fs.existsSync(fullName)) continue
            let manifest = JSON.parse(fs.readFileSync(fullName, 'utf8'))
           objects.push(manifest)
        } 
        if (fs.existsSync(developmentdir)) {
            apps = fs.readdirSync(developmentdir);
            for (let app of apps) {
                if (app.indexOf('.') === 0) continue
                let fullName = developmentdir + '/' + app + '/manifest.json'
                if (!fs.existsSync(fullName)) continue
                let manifest = JSON.parse(fs.readFileSync(fullName, 'utf8'))
                manifest.development = true
                objects.push(manifest)
            } 
        }
        return objects
    }
    install (id, uri, appElememt, resolve) {
   
        let result = null
        try {
            result = buddhalow.request(
                'appfinder',`
                query getBundle ($uri: String!) {
                    findBundle(uri: $uri) { 
                        url,
                        id,
                        name,
                        build {
                            id,
                            fileUrl,
                            version
                        }
                    }
                }`, {
                    uri: uri
                }) 
        } catch (e) {

        }
        if (!result || result.errors || !result.findBundle) 
            result = buddhalow.request(
                'appfinder',`
                query bundle ($id: String!) {
                    bundle(id: $id) { 
                        url,
                        id,
                        name,
                        build {
                            id,
                            fileUrl,
                            version
                        }
                    }
                }`, {
                    id: id
                }) 
        let app = result.findBundle ? result.findBundle : result.bundle
        let url = app.build.fileUrl
        if (url.substr(url.length - 4)  == '.zip') {
            if (app.build == null) reject({error: 'No build found'})
            let home = os.homedir()
            let bungalowdir = home + '/.bungalow'
            if (!fs.existsSync(bungalowdir)) fs.mkdirSync(bungqlowdir)
            if (!fs.existsSync(bungalowdir + '/Apps')) fs.mkdirSync(bungqlowdir + '/Apps')
            let tmpFilePath = os.tmpdir() + '/' + id + '.zip';
            var file = fs.createWriteStream(tmpFilePath);
            var request = http.get(url, function(response) {
                response.on('data', function (data) {
                    fs.appendFileSync(tmpFilePath, data)
                });
                response.on('end', function() {        
                    var zip = new AdmZip(tmpFilePath)
                    let bundleDir = (bungalowdir + '/Apps/' + id)
                    if (fs.existsSync(bundleDir)) {
                        rmdirRecursive.rmdirRecursiveSync(bundleDir)
                    }
                    fs.mkdirSync(bundleDir)
                    zip.extractAllTo(bundleDir)
                    fs.unlinkSync(tmpFilePath)
                    let manifest = JSON.parse(fs.readFileSync(bundleDir + '/manifest.json'))
                    resolve(manifest)                
                })
            })
        }
    }
}