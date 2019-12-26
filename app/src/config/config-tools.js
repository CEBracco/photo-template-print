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
        var wsSender = require('@appSrc/websockets/websocketSender.js');
        const { autoUpdater } = require("electron-updater")
        autoUpdater.logger = require("electron-log")
        autoUpdater.logger.transports.file.level = "info"
        autoUpdater.on('update-available', function () {
            autoUpdater.logger.info("available!")
        })
        autoUpdater.on('download-progress', function (e) {
            autoUpdater.logger.info("download progress", e.percent)
            wsSender.sendDownloadStatus(e.percent)
        })
        autoUpdater.on('update-downloaded', function () {
            autoUpdater.logger.info("downloaded!")
            wsSender.sendUpdateReady()
        })
        // autoUpdater.checkForUpdatesAndNotify()
        autoUpdater.checkForUpdates()
    }
}

module.exports = {
    configure: configure
}