require('module-alias/register')
const log4js = require('log4js');

class Logger {

  getLogger() {
    var logger = log4js.getLogger();
    logger.level = 'debug';
    return logger;
  }
}

module.exports = Logger
