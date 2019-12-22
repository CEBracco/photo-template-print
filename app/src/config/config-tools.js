function configure(basePath) {
    require('dotenv').config({ path: `${basePath}/.env` })
    
    const moduleAlias = require('module-alias')
    moduleAlias.addAlias('@appSrc', basePath + "/app/src")
    moduleAlias.addAlias('@localModules', basePath + "/modules")
    moduleAlias.addPath(basePath + '/modules')
}

module.exports = {
    configure: configure
}