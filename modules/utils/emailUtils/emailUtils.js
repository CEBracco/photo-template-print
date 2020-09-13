const Config = require('@localModules/config/Config.js');
var config = new Config();
var path = require('path');
var nodemailer = require('nodemailer');
const Mustache = require('mustache');

function sendMail(to, subject, body, filename, success) {
    const emailParameters = getEmailParameters()
    var transporter = nodemailer.createTransport({
        host: emailParameters.emailHost,
        port: emailParameters.emailPort,
        secure: emailParameters.emailSecure,
        requireTLS: emailParameters.emailRequireTls,
        auth: {
            user: emailParameters.emailUser,
            pass: emailParameters.emailPassword
        }
    });
    var message = {
        from: emailParameters.emailUser,
        to: to,
        cc: emailParameters.emailCCO,
        bcc: emailParameters.emailUser,
        subject: subject,
        html: Mustache.render(body, { link: getFileLink(emailParameters.url, emailParameters.filePrefix, filename) }).replace(/\r?\n|\r/g, "<br>")
    }
    transporter.sendMail(message, function (error, info) {
        if (error) {
            global.logger.error(error);
        } else {
            global.logger.debug('Email alert sent: ' + info.response);
            movePendingToComplete(filename)
            success()
        }
    });
}

function getEmailParameters() {
    const fs = require('fs-extra');
    if (fs.pathExistsSync(path.join(getPhotosDirPath(), 'config.json'))) {
        let rawdata = fs.readFileSync(path.join(getPhotosDirPath(), 'config.json'));
        return JSON.parse(rawdata);
    } else {
        return false;
    }
}

function getPhotosDirPath() {
    var fs = require('fs-extra');
    fs.mkdirpSync(config.get('PHOTOS_DIR_PATH'));
    return config.get('PHOTOS_DIR_PATH');
}

function getFileLink(webformUrl, filePrefix, filename) {
    //prefix-1599501369180.zip_1599501481205486
    var fileParams = getFileParams(filename, filePrefix)
    var fileLink = `${webformUrl}/lab/${fileParams.timestamp}v${fileParams.generation}/download`
    return fileLink;
}

function getFileParams(filename, filePrefix) {
    return {
        timestamp: filename.replace(`${filePrefix}-`, '').replace(/\..*/g, ''),
        generation: filename.split('_').pop()
    }
}

function movePendingToComplete(filename) {
    var fs = require('fs-extra');
    var src = path.join(getPhotosDirPath(), '/to-send/pending', `${filename}`);
    var dest = path.join(getPhotosDirPath(), '/to-send/completed', `${filename}`);
    fs.moveSync(src, dest, { overwrite: true })
}

module.exports = {
    sendMail: sendMail
}