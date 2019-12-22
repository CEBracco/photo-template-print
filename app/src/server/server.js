const path = require('path');
const Config = require('@localModules/config/Config.js');
const Logger = require('@localModules/logger/Logger.js');
const photoFrame = require('@localModules/utils/photoFrame/photoFrame.js');
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
app.use('/', express.static(getPhotosDirPath()));
app.set('views', appPath + '/app/resources/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get(['/', '/index.html'], function (req, res) {
  resetPhotoDirectory();
  res.render("index", { version: getVersion()});
  res.end();
});

app.get(['/format_selection'], function (req, res) {
  res.render("format_selection", { version: getVersion()});
  res.end();
});

app.get(['/print'], function (req, res) {
  let pageType = req.query.type;
  let selectedYear = req.query.year;
  var previewParameters = getParameters(pageType);
  previewParameters.backgroundStyles = getBackgroundStyles();
  previewParameters.preview = true;
  previewParameters.selectedYear = selectedYear;
  previewParameters.version = getVersion();
  res.render("print", previewParameters);
  res.end();
});

app.get(['/polaroid'], function (req, res) {
  res.render("print/polaroid", getParameters('polaroid'));
  res.end();
});

app.get(['/strip'], function (req, res) {
  res.render("print/strip", getParameters('strip'));
  res.end();
});

app.get(['/instax'], function (req, res) {
  res.render("print/instax", getParameters('instax'));
  res.end();
});

app.get(['/square'], function (req, res) {
  res.render("print/square", getParameters('square'));
  res.end();
});

app.get(['/pennon'], function (req, res) {
  var printParameters = getParameters('pennon');
  printParameters.preview = false;
  res.render("print/pennon", printParameters);
  res.end();
});

app.get(['/calendar'], function (req, res) {
  let selectedYear = req.query.year;
  var printParameters = getParameters('calendar');
  printParameters.preview = false;
  printParameters.selectedYear = selectedYear;
  res.render("print/calendar", printParameters);
  res.end();
});

app.post(['/upload'], function(req, res){
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let photo = req.files.photo;
  var photoPath = path.join(getPhotosDirPath(), `/photos/${new Date().getTime()}_${photo.name}`);
  photo.mv(photoPath, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    fixOrientation(photoPath, function(){
      res.send('File uploaded!');
    })
  });
});

app.post(['/processPhotos'], function (req, res) {
  renamePhotos();
  res.json({ok: true});
});

app.post(['/rotateImage'], function (req, res) {
  var Jimp = require('jimp');
  Jimp.read(path.join(getPhotosDirPath(), `/photos/${req.body.filename}`), (err, image) => {
    if (err) throw err;
    image.rotate(req.body.angle ? req.body.angle : 90) 
      .write(path.join(getPhotosDirPath(), `/photos/${req.body.filename}`)); // save
    res.json({ ok: true });
  });
});

app.post(['/addFrame'], function (req, res) {
  var fs = require('fs-extra');
  var framedPhotosDir = path.join(getPhotosDirPath(), `/photos-framed`)
  var photoPath = path.join(getPhotosDirPath(), `/photos/${req.body.filename}`)
  var parameters = getParameters(req.body.type)
  fs.mkdirp(framedPhotosDir, function (err) {
    photoFrame.add(photoPath, function(photo) {
      photo.write(path.join(framedPhotosDir, `${req.body.filename}`));
      res.json({ ok: true });
    }, parameters.proportion[0], parameters.proportion[1])
  });
});

function getParameters(pageType) {
  switch (pageType) {
    case "polaroid":
      return { pageType: pageType, pages: _.chunk(getPhotos(), 5), proportion: [100,100] };
    case "instax":
      return { pageType: pageType, pages: _.chunk(getPhotos(), 7), proportion: [62.5, 100] };
    case "square":
      return { pageType: pageType, pages: _.chunk(getPhotos(), 6), proportion: [100, 100] };
    case "strip":
      return { pageType: pageType, pages: _.chunk(_.chunk(getPhotos(), 4), 6), proportion: [100, 100] };
    case "pennon":
      return { pageType: pageType, pages: _.chunk(getPhotos(), 2), proportion: [100, 100] };
    case "calendar":
      return { pageType: pageType, pages: _.chunk(getPhotos(), 3), proportion: [100, 100] };
    default:
      return { pageType: pageType };
  }
}

function getPhotos() {
  var fs = require('fs');
  return _.filter(
    fs.readdirSync(path.join(getPhotosDirPath(), '/photos')), 
    function (f) { return !/^\./g.test(f)});
}

function renamePhotos() {
  var fs = require('fs');
  var files = []
  getPhotos().forEach(function(file, index){
    let basePath = path.join(getPhotosDirPath(), '/photos/')
    filename = basePath + file;
    fs.renameSync(filename, basePath + file.replace(/.*\./g, `${index}.`));
  });
}

function resetPhotoDirectory(){
  var fs = require('fs-extra');
  fs.removeSync(path.join(getPhotosDirPath(), '/photos-framed'))
  getPhotos().forEach(function (file, index) {
    let basePath = path.join(getPhotosDirPath(), '/photos/')
    filename = basePath + file;
    fs.unlinkSync(filename);
  });
}

function getBackgroundStyles() {
  var fs = require('fs');
  var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  var styles = _.map(
    fs.readdirSync(path.join(appPath, '/app/resources/static/backgroundStyles')).sort(collator.compare),
    function (f) { return { name: 'Diseño ' + f.replace(/\..*/g, ''), filename: f } });
  styles.unshift({ name: 'Ninguno', filename: null })
  return styles;
}

function fixOrientation(photoPath, callback) {
  const jo = require('jpeg-autorotate')
  jo.rotate(photoPath, {}, (error, buffer, orientation, dimensions, quality) => {
    if (error) {
      // console.log('An error occurred when rotating the file: ' + error.message)
      callback(error);
      return
    }
    var fs = require('fs');
    fs.writeFile(photoPath, buffer, function (err) {
      if (err) {
        // console.log('An error occurred when saving the file: ' + err.message)
        callback(err);
        return
      }
      callback(err);
    });
  })
}

function getVersion() {
  var pjson = require(path.join(appPath, '/package.json'));
  return pjson.version; 
}

function start() {
  port = port ? port : 3000;
  app.listen(port, function () {
    logger.getLogger().debug("Static file server running at port => " + port);
  }).on('error', function (err) {
    process.exit(0)
  });
}

function getPhotosDirPath() {
  var fs = require('fs-extra');
  fs.mkdirpSync(config.get('PHOTOS_DIR_PATH'));
  fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/photos'));
  fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/photos-framed'));
  return config.get('PHOTOS_DIR_PATH');
}

module.exports = {
  start: start
}
