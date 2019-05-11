const path = require('path');
const url = require('url');
const Config = require('@localModules/config/Config.js');
const Logger = require('@localModules/logger/Logger.js');

const { app, BrowserWindow } = require('electron');

let mainWindow


function start() {
    app.on("browser-window-created", function (e, window) {
        window.setMenu(null);
    });
    app.on("ready", () => {
        mainWindow = new BrowserWindow({
            title: 'Flor Barrau Fotografía',
            icon: path.dirname(require.main.filename) + '/app/resources/static/img/icon.ico',
            backgroundColor: "#252526",
            show: false
        });
        mainWindow.loadURL(url.format({
            protocol: 'http',
            hostname: 'localhost',
            port: Config.get('PORT') ? config.get('PORT') : 3000
        }));
        mainWindow.webContents.on('did-finish-load', function () {
            setTimeout(function () {
                mainWindow.maximize()
                mainWindow.show();
            }, 40);
        });
    });
}

module.exports = {
    start: start
}