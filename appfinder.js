const path = require("path");
const url = require("url");
const fs = require("fs");
const os = require("os");
const http = require("http");
const express = require("express");

let bungalowDir = process.env.BUNGALOW_PATH ?? (os.homedir() + "/.bungalow");

if (!fs.existsSync(bungalowDir)) {
  fs.mkdirSync(bungalowDir);
}

let installedAppsDir = process.env.BUNGALOW_APPS_PATH ?? (bungalowDir + "/Apps");

if (!fs.existsSync(installedAppsDir)) {
  fs.mkdirSync(installedAppsDir);
}

let developmentAppsDir = process.env.BUNGALOW_DEVELOPMENT_PATH ?? (bungalowDir + "/Apps");

let paths = [
  `${developmentAppsDir}/${url}`,
  `${installedAppsDir}/${url}`,
  `${__dirname}/client/apps/${url}`,
];

module.exports = class AppFinder {
  constructor() {}
  createServer() {
    let server = express();
    server.get(
      "/*",
      function () {
        let path = paths.filter((p) => fs.existsSync(p))[0];
        console.log(path);
        res.sendFile(path);
      },
      (error) => {
        res.json().send();
      }
    );
    return server;
  }
  getApps() {
    let objects = [];
    let apps = fs.readdirSync("./client/apps");
    for (let app of apps) {
      if (app.indexOf(".") === 0) continue;
      let fullName = "./client/apps/" + app + "/manifest.json";
      if (!fs.existsSync(fullName)) continue;
      let manifest = JSON.parse(fs.readFileSync(fullName, "utf8"));
      objects.push(manifest);
    }
    apps = fs.readdirSync(installedAppsDir);
    for (let app of apps) {
      const installedAppDir = installedAppsDir + "/" + app
      if (app.indexOf(".") === 0) continue;
      let fullName = `${installedAppDir}/manifest.json`;
      if (!fs.existsSync(fullName)) continue;
      let manifest = JSON.parse(fs.readFileSync(fullName, "utf8"));
      objects.push(manifest);
    }
    if (fs.existsSync(developmentAppsDir)) {
      apps = fs.readdirSync(developmentAppsDir);
      for (let app of apps) {
        const developmentAppDir = developmentAppsDir + "/" + app
        if (app.indexOf(".") === 0) continue;
        let fullName = developmentAppDir + "/manifest.json";
        if (!fs.existsSync(fullName)) continue;
        let manifest = JSON.parse(fs.readFileSync(fullName, "utf8"));
        manifest.development = true;
        objects.push(manifest);
      }
    }
    return objects;
  }
  install(id, uri, appElememt, resolve) {
    let result = null;
    try {
      result = buddhalow.request(
        "appfinder",
        `
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
          }`,
        {
          uri: uri,
        }
      );
    } catch (e) {}
    if (!result || result.errors || !result.findBundle)
      result = buddhalow.request(
        "appfinder",
        `
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
          }`,
        {
          id: id,
        }
      );
    let app = result.findBundle ? result.findBundle : result.bundle;
    let url = app.build.fileUrl;
    if (url.substr(url.length - 4) == ".zip") {
      if (app.build == null) reject({ error: "No build found" });
      if (!fs.existsSync(bungalowDir)) fs.mkdirSync(bungalowDir);
      if (!fs.existsSync(installedAppsDir))
        fs.mkdirSync(installedAppsDir);
      let tmpFilePath = os.tmpdir() + "/" + id + ".zip";
      var file = fs.createWriteStream(tmpFilePath);
      var request = http.get(url, function (response) {
        response.on("data", function (data) {
          fs.appendFileSync(tmpFilePath, data);
        });
        response.on("end", function () {
          var zip = new AdmZip(tmpFilePath);
          let bundleDir = installedAppsDir + "/Apps/" + id;
          if (fs.existsSync(bundleDir)) {
            rmdirRecursive.rmdirRecursiveSync(bundleDir);
          }
          fs.mkdirSync(bundleDir);
          zip.extractAllTo(bundleDir);
          fs.unlinkSync(tmpFilePath);
          let manifest = JSON.parse(fs.readFileSync(bundleDir + "/manifest.json"));
          resolve(manifest);
        });
      });
    }
  }
};
