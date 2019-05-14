const path = require('path');
const Config = require('@localModules/config/Config.js');
const Logger = require('@localModules/logger/Logger.js');
const _ = require('lodash');
const express = require('express');
const fileUpload = require('express-fileupload');
const secure = require('express-force-https');

var config = new Config();
var logger = new Logger();
var port = config.get('PORT');
var app = express();
var appPath = path.dirname(require.main.filename);

app.use(secure);
app.use(express.json());
app.use(fileUpload());
app.use('/', express.static(appPath + '/app/resources/static'));
app.set('views', appPath + '/app/resources/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get(['/', '/index.html'], function (req, res) {
  resetPhotoDirectory();
  res.render("index", {});
  res.end();
});

app.get(['/format_selection'], function (req, res) {
  res.render("format_selection", {});
  res.end();
});

app.get(['/print'], function (req, res) {
  let pageType = req.query.type;
  res.render("print", getParameters(pageType));
  res.end();
});

app.get(['/polaroid'], function (req, res) {
  res.render("print/polaroid", { pages: _.chunk(getPhotos(), 5) });
  res.end();
});


app.post(['/upload'], function(req, res){
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let photo = req.files.photo;
  photo.mv(path.join(appPath, `/app/resources/static/photos/${new Date().getTime()}_${photo.name}`), function (err) {
    if (err)
      return res.status(500).send(err);
    res.send('File uploaded!');
  });
});

app.post(['/processPhotos'], function (req, res) {
  renamePhotos();
  res.json({ok: true});
});

function getParameters(pageType) {
  switch (pageType) {
    case "polaroid":
      return { pageType: pageType, pages: _.chunk(getPhotos(), 5) };
    default:
      return { pageType: pageType };
  }
}

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

function resetPhotoDirectory(){
  var fs = require('fs');
  getPhotos().forEach(function (file, index) {
    let basePath = path.join(appPath, '/app/resources/static/photos/')
    filename = basePath + file;
    fs.unlinkSync(filename);
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
