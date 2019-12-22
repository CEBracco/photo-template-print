function configure(basePath) {
    //autoUpdater
    const { autoUpdater } = require("electron-updater")
    autoUpdater.logger = require("electron-log")
    autoUpdater.logger.transports.file.level = "info"
    autoUpdater.checkForUpdatesAndNotify()

    //dotEnv
    require('dotenv').config({ path: `${basePath}/.env` })
    
    //moduleAlias
    const moduleAlias = require('module-alias')
    moduleAlias.addAlias('@appSrc', basePath + "/app/src")
    moduleAlias.addAlias('@localModules', basePath + "/modules")
    moduleAlias.addPath(basePath + '/modules')
}

module.exports = {
    configure: configure
}