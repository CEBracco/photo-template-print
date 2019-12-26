var connectionPool = require('../connectionPool/connectionPool');

function broadcastMessage(message) {
    doBroadcast(connectionPool.getConnections(), message);
}

function doBroadcast(connections, message) {
    connections.forEach(connection => {
        connection.sendUTF(JSON.stringify(message));
    });
}

module.exports = {
    broadcastMessage: broadcastMessage
}