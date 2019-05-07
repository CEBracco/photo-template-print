const path = require('path');
const url = require('url');
const Config = require('@localModules/config/Config.js');
const Logger = require('@localModules/logger/Logger.js');

const { app, BrowserWindow } = require('electron');

let mainWindow


function start() {
    app.on("ready", () => {
        mainWindow = new BrowserWindow({});
        mainWindow.loadURL(url.format({
            protocol: 'http',
            hostname: 'localhost',
            port: Config.get('PORT') ? config.get('PORT') : 3000
        }))
    });
}

module.exports = {
    start: start
}