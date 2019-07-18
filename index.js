require('module-alias/register');
const Logger = require('./modules/logger/Logger.js');
const server = require('@appSrc/server/server.js');
const interface = require('@appSrc/interface/interface.js');

var logger = new Logger();

server.start();
if (process.versions.hasOwnProperty('electron')) {
    interface.start();
}