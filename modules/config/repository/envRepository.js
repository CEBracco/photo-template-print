function get(key){
  return process.env[key];
}

function getBoolean(key){
  return (get(key) === 'true');
}

module.exports = {
  get:get,
  getBoolean:getBoolean
}
