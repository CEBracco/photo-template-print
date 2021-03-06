configRepository = process.env.CONFIG_REPOSITORY ? process.env.CONFIG_REPOSITORY : 'env';
repository = require(`./repository/${configRepository}Repository.js`);

class Config {

  constructor(){}

  static get(key) {
    return repository.get(key);
  }

  static getBoolean(key) {
    return repository.getBoolean(key);
  }

  get(key) {
    return repository.get(key);
  }

  getBoolean(key) {
    return repository.getBoolean(key);
  }
}

module.exports = Config
