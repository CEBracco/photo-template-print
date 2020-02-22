const path = require('path');
const url = require('url');
const Config = require('@localModules/config/Config.js');
const Logger = require('@localModules/logger/Logger.js');

const { app, BrowserWindow, BrowserView } = require('electron');

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
            show: false,
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
        mainWindow.loadURL(url.format({
            protocol: 'http',
            hostname: 'localhost',
            port: Config.get('PORT') ? config.get('PORT') : 3000
        }) + '/components/titlebar.html');
        mainWindow.webContents.on('did-finish-load', function () {
            mainView = new BrowserView()
            mainWindow.setBrowserView(mainView)
            mainView.setAutoResize({ width: false, height: false });
            
            mainView.webContents.loadURL(url.format({
                protocol: 'http',
                hostname: 'localhost',
                port: Config.get('PORT') ? config.get('PORT') : 3000
            }));
            mainView.webContents.on('did-finish-load', function () {
                setTimeout(function () {
                    mainWindow.maximize()
                    setViewBounds()
                    mainWindow.show();
                }, 40);
            });
    
            mainWindow.on('maximize', setViewBounds);
            mainWindow.on('resize', setViewBounds);
            createContextMenu(mainView)
            var alreadyMaximized = false;
            function setViewBounds() {
                if (mainWindow.isMaximized()) {
                    if (!alreadyMaximized) {
                        //needs to rebound to maximized mode
                        var bounds = mainWindow.getBounds()
                        bounds.y = 32;
                        bounds.x = 0;
                        bounds.height = bounds.height - 48;
                        bounds.width = bounds.width - 15;
                        mainView.setBounds(bounds)
                        alreadyMaximized = true;
                    }
                } else {
                    //ignores minimized case
                    if (!mainWindow.isMinimized()){
                        //needs to rebound to restored mode
                        var bounds = mainWindow.getBounds()
                        bounds.y = 32;
                        bounds.x = 0;
                        bounds.height = bounds.height - 32;
                        bounds.width = bounds.width;
                        mainView.setBounds(bounds)
                        alreadyMaximized = false;
                    }
                }
            }
        });
    });
    global.electronApp = app
}

function createContextMenu(webContents) {
    const contextMenu = require('electron-context-menu');
    contextMenu({
        window: webContents,
        showCopyImage: false,
        showCopyImageAddress: false,
        showSaveImageAs: false,
        showInspectElement: false,
        showLookUpSelection: false,
        shouldShowMenu: (event, params) => !params.isEditable,
        labels: {
            copy: 'Copiar',
            cut: 'Cortar',
            paste: 'Pegar'
        }
    });
}

module.exports = {
    start: start
}