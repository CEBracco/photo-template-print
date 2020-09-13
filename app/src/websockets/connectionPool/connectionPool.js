global.websocketConnections = [];
let _ = require('lodash');

function pushConnection(connection) {
    global.websocketConnections.push(connection);
}

function removeConnection(connection) {
    // global.websocketConnections = _.without(global.websocketConnections, _.find(global.websocketConnections, { remoteAddress: connection.remoteAddress }))
    global.websocketConnections = _.without(global.websocketConnections, _.find(global.websocketConnections, { identifier: connection.identifier }));
}

function getConnections() {
    return global.websocketConnections;
}

module.exports = {
    pushConnection: pushConnection,
    removeConnection: removeConnection,
    getConnections: getConnections
}