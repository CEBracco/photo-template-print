require('./app/src/config/config-tools').configure(__dirname)

require('module-alias/register');
const Logger = require('@localModules/logger/Logger.js');
const server = require('@appSrc/server/server.js');
const interface = require('@appSrc/interface/interface.js');

var logger = new Logger();

server.start();
if (process.versions.hasOwnProperty('electron')) {
    interface.start();
}