function configure(basePath) {
    //dotEnv
    require('dotenv').config({ path: `${basePath}/.env` })
    
    //moduleAlias
    const moduleAlias = require('module-alias')
    moduleAlias.addAlias('@appSrc', basePath + "/app/src")
    moduleAlias.addAlias('@localModules', basePath + "/modules")
    moduleAlias.addPath(basePath + '/modules')

    //autoUpdater
    if (process.versions.hasOwnProperty('electron')) {
        global.updateAvailable = false
        global.updateFound = false
        var wsSender = require('@appSrc/websockets/websocketSender.js');
        const { autoUpdater } = require("electron-updater")
        // autoUpdater.logger = require("electron-log")
        // autoUpdater.logger.transports.file.level = "info"
        autoUpdater.on('update-available', function () {
            // autoUpdater.logger.info("available!")
            global.updateFound = true
        })
        autoUpdater.on('download-progress', function (e) {
            wsSender.sendDownloadStatus(e.percent)
        })
        autoUpdater.on('update-downloaded', function () {
            global.updateAvailable = true
            wsSender.sendUpdateReady()
        })
        global.autoUpdater = autoUpdater;
        
        // checkForUpdates loop
        autoUpdater.checkForUpdates()
        setInterval(function() {
            if (!global.updateFound){
                autoUpdater.checkForUpdates()
            }
        }, 60000)
    }
}

module.exports = {
    configure: configure
}