const path = require('path');
const Config = require('@localModules/config/Config.js');
const Logger = require('@localModules/logger/Logger.js');
const _ = require('lodash');
const express = require('express');
const secure = require('express-force-https');

var config = new Config();
var logger = new Logger();
var port = config.get('PORT');
var app = express();
var appPath = path.dirname(require.main.filename);

app.use(secure);
app.use(express.json());
app.use('/', express.static(appPath + '/app/resources/static'));
app.set('views', appPath + '/app/resources/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get(['/', '/index.html'], function (req, res) {
  res.render("index", { foo: "world" });
  res.end();
});

app.get(['/polaroid.html'], function (req, res) {
  renamePhotos();
  res.render("polaroid", { pages: _.chunk(getPhotos(), 5) });
  res.end();
});

function getPhotos() {
  var fs = require('fs');
  return _.filter(
    fs.readdirSync(path.join(appPath, '/app/resources/static/photos')), 
    function (f) { return !/^\./g.test(f)});
}

function renamePhotos() {
  var fs = require('fs');
  var files = []
  getPhotos().forEach(function(file, index){
    let basePath = path.join(appPath, '/app/resources/static/photos/')
    filename = basePath + file;
    fs.renameSync(filename, basePath + file.replace(/.*\./g, `${index}.`));
  });
}

function start() {
  port = port ? port : 3000;
  app.listen(port, function () {
    logger.getLogger().debug("Static file server running at port => " + port);
  });
}

module.exports = {
  start: start
}
