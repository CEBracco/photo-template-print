require('module-alias/register');
const Logger = require('./modules/logger/Logger.js');
const server = require('@appSrc/server/server.js')

var logger = new Logger();

server.start();