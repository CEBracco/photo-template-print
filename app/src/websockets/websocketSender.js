var websocketUtils = require('./utils/websocketUtils');

function sendDownloadStatus(progress) {
    websocketUtils.broadcastMessage({ type: 'downloadStatus', progress: progress });
}

function sendUpdateReady() {
    websocketUtils.broadcastMessage({ type: 'updateReady' });
}

function sendUploadToLabStatus(file, progress) {
    websocketUtils.broadcastMessage({ type: 'uploadToLabProgress', file: file, progress: progress });
}

function sendUploadToLabComplete(file) {
    websocketUtils.broadcastMessage({ type: 'uploadToLabComplete', file: file});
}

module.exports = {
    sendDownloadStatus: sendDownloadStatus,
    sendUpdateReady: sendUpdateReady,
    sendUploadToLabStatus: sendUploadToLabStatus,
    sendUploadToLabComplete: sendUploadToLabComplete
}