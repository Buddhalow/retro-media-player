const srv = require('./index.js');
var fs = require('fs');
var os = require('os');
var http = require('http');
var https = require('https');

var certificateFileName = os.homedir() + '/.bungalow/server.crt'
var privateKeyFileName = os.homedir() + '/.bungalow/server.key'

const {app, BrowserWindow} = require('electron');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win



  function createWindow () {

    // Create the browser window.
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: false
        },
        titleBarStyle: 'hiddenInset'
    })

    // and load the index.html of the app.
    win.loadURL('http://localhost:2858')
      console.log("A");

    // Open the DevTools.
    win.webContents.openDevTools()

    // Protocol handler for win32
    if (process.platform === 'win32') {
      // Keep only command line / deep linked arguments
      deeplinkingUrl = process.argv.slice(1)
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    });
    /*
    if (fs.existsSync(certificateFileName)) {
        let credentials = {
            key: fs.readFileSync(privateKeyFileName),
            cert: fs.readFileSync(certificateFileName)
        }
        console.log("Running with certificate")
        let server2 = https.createServer(credentials, srv).listen(443, 'buddhalow.app');

        server2.timeout = 5000;

    } else {
        let server = http.createServer(srv).listen(2858);
        server.timeout = 5000
    }
    */
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      console.log("Create Window")
      createWindow()
    }
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient('spotify')

  // Protocol handler for osx
  app.on('open-url', function (event, url) {
    event.preventDefault()
    deeplinkingUrl = url
    if (win && win.webContents) {
      win.webContents.executeJavaScript(`document.querySelector("sp-viewstack").navigate("${url}")`)
    }
    // logEverywhere("open-url# " + deeplinkingUrl)

  })

  // Log both at dev console and at running node console instance
  function logEverywhere(s) {
    throw s
      if (win && win.webContents) {
          win.webContents.executeJavaScript(`alert("${s}")`)
      }
  }

