const config = require('@localModules/config/Config.js');
const Logger = require('@localModules/logger/Logger.js');
var logger = new Logger().getLogger();
var connectionPool = require('../connectionPool/connectionPool');


function start(server) {
    var WebSocketServer = require('websocket').server;
    wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: true
    });

    wsServer.on('connect', function (connection) {
        // logger.debug((new Date()) + ' Connection accepted.');
        connectionPool.pushConnection(connection);
    })

    wsServer.on('close', function (connection) {
        connectionPool.removeConnection(connection);
        // logger.debug((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    })
}

module.exports = {
    start: start
}