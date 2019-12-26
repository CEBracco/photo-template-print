var websocketUtils = require('./utils/websocketUtils');

function sendDownloadStatus(progress) {
    websocketUtils.broadcastMessage({ type: 'downloadStatus', progress: progress });
}

function sendUpdateReady() {
    websocketUtils.broadcastMessage({ type: 'updateReady' });
}

module.exports = {
    sendDownloadStatus: sendDownloadStatus,
    sendUpdateReady: sendUpdateReady
}