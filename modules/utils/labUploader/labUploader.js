const Config = require('@localModules/config/Config.js');
var config = new Config();
var path = require('path');
var wsSender = require('@appSrc/websockets/websocketSender.js');

function upload(filename) {
    var fs = require('fs');
    var fileSize = fs.statSync(filename).size;
    var realFilename = path.basename(filename)

    const bucketName = 'gs://florbarraufotografia-polly.appspot.com';
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage();

    // Uploads a local file to the bucket
    storage.bucket(bucketName).upload(filename, {
        public: true,
        gzip: true,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
        onUploadProgress: progressEvent => {
            const percentage = (progressEvent.bytesWritten * 100) / fileSize
            wsSender.sendUploadToLabStatus(realFilename, percentage)
        }
    }).then(([file, storageObject]) => {
        moveToPendingToMail(realFilename, storageObject.generation);
        wsSender.sendUploadToLabComplete(realFilename)
    });
}

function moveToPendingToMail(filename, generation) {
    var fs = require('fs-extra');
    var src = path.join(getPhotosDirPath(), '/to-send/', filename);
    var dest = path.join(getPhotosDirPath(), '/to-send/pending', `${filename}_${generation}`);
    fs.moveSync(src, dest, { overwrite: true })
}

function getPhotosDirPath() {
    var fs = require('fs-extra');
    fs.mkdirpSync(config.get('PHOTOS_DIR_PATH'));
    fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/to-send'));
    fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/to-send/pending'));
    fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/to-send/completed'));
    return config.get('PHOTOS_DIR_PATH');
}

module.exports = {
    upload: upload
}