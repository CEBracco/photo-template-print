const path = require('path');
const Config = require('@localModules/config/Config.js');
const Logger = require('@localModules/logger/Logger.js');
const photoFrame = require('@localModules/utils/photoFrame/photoFrame.js');
const labUploader = require('@localModules/utils/labUploader/labUploader.js');
const _ = require('lodash');
const express = require('express');
const fileUpload = require('express-fileupload');
const secure = require('express-force-https');

var AdmZip = require('adm-zip');
var zip = require('bestzip');

var config = new Config();
global.logger = (new Logger()).getLogger();
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
  res.render("index", { 
    version: getVersion(), 
    updateAvailable: global.updateAvailable,
    getTranslatedStatus: getTranslatedStatus,
    statuses: statuses,
    defaultStatusesActive: defaultStatusesActive
  });
  res.end();
});

app.get(['/format_selection'], function (req, res) {
  res.render("format_selection", { version: getVersion(), updateAvailable: global.updateAvailable });
  res.end();
});

app.get(['/print'], function (req, res) {
  let pageType = req.query.type;
  var previewParameters = getParameters(pageType);
  previewParameters.backgroundStyles = getBackgroundStyles(pageType);
  previewParameters.preview = true;
  previewParameters.version = getVersion();
  previewParameters.updateAvailable = global.updateAvailable
  previewParameters.isCodesAllowed = isCodesAllowed(pageType)
  previewParameters = setCalendarParameters(req, previewParameters);
  if (pageType == 'strip') {
    previewParameters = setStripParameters(req, previewParameters);
  }
  res.render("print", previewParameters);
  res.end();
});

app.get(['/polaroid'], function (req, res) {
  res.render("print/polaroid", getParameters('polaroid'));
  res.end();
});

app.get(['/strip'], function (req, res) {
  var printParameters = getParameters('strip');
  printParameters = setStripParameters(req, printParameters);
  res.render("print/strip", printParameters);
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
  var printParameters = getParameters('calendar');
  printParameters.preview = false;
  printParameters = setCalendarParameters(req, printParameters);
  res.render("print/calendar", printParameters);
  res.end();
});

app.get(['/mini-polaroid'], function (req, res) {
  res.render("print/mini-polaroid", getParameters('mini-polaroid'));
  res.end();
});

app.get(['/wide'], function (req, res) {
  res.render("print/wide", getParameters('wide'));
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
  var fs = require('fs-extra');
  const sharp = require('sharp');
  sharp.cache(false)
  sharp(path.join(getPhotosDirPath(), `/photos/${req.body.filename}`))
    .rotate(req.body.angle ? req.body.angle : 90)
    .toBuffer(function (err, buffer) {
      fs.writeFile(path.join(getPhotosDirPath(), `/photos/${req.body.filename}`), buffer, function (e) {
        res.json({ ok: true });
      });
    });
});

app.post(['/addFrame'], function (req, res) {
  var fs = require('fs-extra');
  var framedPhotosDir = path.join(getPhotosDirPath(), `/photos-framed`)
  var photoPath = path.join(getPhotosDirPath(), `/photos/${req.body.filename}`)
  var parameters = getParameters(req.body.type)
  fs.mkdirp(framedPhotosDir, function (err) {
    photoFrame.add(photoPath, function(photo) {
      photoFrame.toFile(photo, path.join(framedPhotosDir, `${req.body.filename}`), function() {
        res.json({ ok: true });
      })
    }, parameters.proportion[0], parameters.proportion[1])
  });
});

app.post(['/previewCode'], function (req, res) {
  var type = getParameters(req.body.type)
  var QRCode = require('qrcode');
  var content = req.body.content ? req.body.content : 'empty';
  var dotsColor = req.body.dotsColor ? req.body.dotsColor : '#000'; 
  QRCode.toString(content, {
    type: 'svg',
    color: {
      dark: dotsColor,
      light: '#0000'
    }
  }, function (err, url) {
      err ? res.json({ ok: false }) : res.send({ ok: true, data: Buffer.from(url).toString('base64') });
  })
});

app.post(['/webformConfig'], function (req, res) {
  if (getWebformParameters()) {
    res.json({ ok: true, data: getWebformParameters() });
  } else {
    res.json({ ok: false });
  }
});

function getWebformParameters() {
  const fs = require('fs-extra');
  if (fs.pathExistsSync(path.join(getPhotosDirPath(), 'config.json'))) {
    let rawdata = fs.readFileSync(path.join(getPhotosDirPath(), 'config.json'));
    return JSON.parse(rawdata);
  } else {
    return false;
  }
}

app.post(['/saveWebformConfig'], function (req, res) {
  if (req.body.url && req.body.token) {
    var webformConfig = {
      url: req.body.url.trim(),
      token: req.body.token.trim()
    }
    var fs = require('fs');
    fs.writeFile(path.join(getPhotosDirPath(), 'config.json'), JSON.stringify(webformConfig), function (err) {
      if (err) {
        res.json({ ok: false });
      } else {
        res.json({ ok: true, data: getWebformParameters() });
      }
    });
  } else {
      res.json({ ok: false });
  }
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
    case "mini-polaroid":
      return { pageType: pageType, pages: _.chunk(getPhotos(), 12), proportion: [100, 100] };
    case "wide":
      return { pageType: pageType, pages: _.chunk(getPhotos(), 4), proportion: [100, 63.59] };
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

function getPhotosDetailed() {
  var fs = require('fs');
  return _.map(
    _.filter(fs.readdirSync(path.join(getPhotosDirPath(), '/photos')),function (f) { return !/^\./g.test(f) }), 
    function(f) {
      return { name: f}
    });
}

function renamePhotos(unique = false) {
  var fs = require('fs');
  var files = []
  getPhotos().forEach(function(file, index){
    let basePath = path.join(getPhotosDirPath(), '/photos/')
    filename = basePath + file;
    let timestamp = Date.now()
    fs.renameSync(filename, basePath + file.replace(/.*\./g, `${unique ? timestamp : ''}-${index}.`));
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

function getBackgroundStyles(pageType) {
  var fs = require('fs');
  var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  var styles = _.map(
    fs.readdirSync(path.join(appPath, '/app/resources/static/backgroundStyles')).sort(collator.compare),
    function (f) { return { name: 'Diseño ' + f.replace(/\..*/g, ''), filename: f } });
  styles.unshift({ name: 'Ninguno', filename: null })
  // Filter all that not correspond to actual pageType
  var allPageTypes = ["polaroid", "instax", "square", "strip", "pennon", "calendar", "mini-polaroid", "wide"]
  var pageTypes= allPageTypes.filter(pt => pt != pageType.split('-').pop())
  var filteredStyles = styles.filter(style => {
    return !pageTypes.some(pt => style.name.includes(pt))
  }).map(x => {
    var splitted = x.name.split('-')
    x.name = splitted.length > 1 ? splitted.slice(0, -1).join('-') : splitted.join('-')
    return x
  })
  return filteredStyles;
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

function initWebsocketServer(server) {
  var wsServer = require('@appSrc/websockets/server/websocketServer.js');
  return wsServer.start(server);
}

function start() {
  deletePendingUploads();
  port = port ? port : 3000;
  const server = require('http').createServer(app);
  initWebsocketServer(server);
  server.listen(port, function () {
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
  fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/to-send'));
  fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/to-send/pending'));
  fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/to-send/completed'));
  fs.mkdirpSync(path.join(config.get('PHOTOS_DIR_PATH'), '/credentials'));
  return config.get('PHOTOS_DIR_PATH');
}

app.get(['/restart'], function (req, res) {
  if (global.electronApp) {
    setImmediate(() => {
      global.autoUpdater.quitAndInstall();
    })
  }
  res.json({ ok: true });
});

// order status logic
let statuses = ['pending', 'design', 'print', 'packaging', 'ready', 'delivered']
let defaultStatusesActive = ['pending', 'design', 'print', 'packaging', 'ready']

function getTranslatedStatus(status) {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'design':
      return 'Diseño'
    case 'print':
      return 'Impresión'
    case 'packaging':
      return 'Corte y Empaquetado'
    case 'ready':
      return 'Listo para la entrega'
    case 'delivered':
      return 'Entregado'
    default:
      return ''
  }
}

app.post(['/downloadOrder'], function (req, res) {
  var webformParameters = getWebformParameters();
  var orderHash = req.body.orderHash
  const https = require('https');
  const fs = require('fs');
  const dest = path.join(getPhotosDirPath(), `${orderHash}.zip`)
  const file = fs.createWriteStream(dest);
  let downloadURL = path.join(webformParameters.url, `/checkout/${webformParameters.token}/${orderHash}/download`);
  let requestOptions = { 
    host: webformParameters.url.replace('https://', ''), 
    path: `/checkout/${webformParameters.token}/${orderHash}/download`, 
    rejectUnauthorized: false 
  }
  // Fix strange electron ssl download error
  //var request = https.get(downloadURL, function (response) {
  var request = https.get(requestOptions, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function (err) { // Handle errors
    console.log(err);
    fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
  var cb = function(err) {
    if(!err) {
      var zip = new AdmZip(dest);
      zip.extractAllTo(path.join(getPhotosDirPath(), '/photos'), true);
      fs.unlinkSync(dest);
      renamePhotos(true)
      res.json({ ok: true, data: getPhotosDetailed() });
    } else {
      res.json({ ok: false });
    }
  }
});

app.post('/deletePhoto', function (req, res) {
  if (req.body.filename) {
    const fs = require('fs-extra')
    fs.removeSync(path.join(getPhotosDirPath(), `/photos/${req.body.filename}`))
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
})

app.post('/uploadToSend', function (req, res) {
  const timestamp = new Date().getTime()
  const folderName = `florbarraufotografia-${timestamp}` 
  const dest = path.join(getPhotosDirPath(), `/to-send/${ folderName }`)
  var fs = require('fs-extra');
  fs.mkdirpSync(dest);
  var photoPromisses = [];
  if (!Array.isArray(req.files.photos)) {
    req.files.photos = [req.files.photos]
  }
  for (let photoIndex = 0; photoIndex < req.files.photos.length; photoIndex++) {
    const photo = req.files.photos[photoIndex];
    var photoPath = path.join(dest, `photo-${timestamp}-${photoIndex}.jpg`);
    photoPromisses.push(
      photo.mv(photoPath, function (err) {
        if (err) {
          return res.status(500).send(err);
        }
      })
    )
  }
  Promise.all(photoPromisses).then(() => {
    zip({
      source: '*',
      destination: `${dest}.zip`,
      cwd: dest
    }).then(function () {
      var fs = require('fs-extra');
      fs.removeSync(dest)
      labUploader.upload(`${dest}.zip`)
      res.json({ ok: true, data: { order: folderName } });
    }).catch(function (err) {
      return res.status(500).send(err);
    });
  })
})

app.post('/labUploads', function (req, res) {
  var fs = require('fs');
  res.json({ 
    ok: true, 
    uploads: _.filter(fs.readdirSync(path.join(getPhotosDirPath(), '/to-send/'), { withFileTypes: true }), function (f) { 
      return f.isFile() && !/^\./g.test(f)
    }).map(dirent => dirent.name),
    pending: _.filter(fs.readdirSync(path.join(getPhotosDirPath(), '/to-send/pending'), { withFileTypes: true }), function (f) {
      return f.isFile() && !/^\./g.test(f)
    }).map(dirent => dirent.name),
    completed: _.filter(fs.readdirSync(path.join(getPhotosDirPath(), '/to-send/completed'), { withFileTypes: true }), function (f) {
      return f.isFile() && !/^\./g.test(f)
    }).map(dirent => dirent.name)  
  });
})

app.post('/deleteLabUpload', function (req, res) {
  var fs = require('fs-extra');

  fs.removeSync(path.join(getPhotosDirPath(), '/to-send/', req.body.filename));
  deleteIfMatch('/to-send/pending', req.body.filename)
  deleteIfMatch('/to-send/completed', req.body.filename)

  res.json({ ok: true })
})

function deleteIfMatch(basePath, filename) {
  var fs = require('fs-extra');

  _.filter(fs.readdirSync(path.join(getPhotosDirPath(), basePath), { withFileTypes: true }), function (f) {
    return f.isFile() && !/^\./g.test(f)
  }).map(dirent => dirent.name).forEach(fileInDir => {
    if (fileInDir.includes(filename)) {
      fs.removeSync(path.join(getPhotosDirPath(), basePath, fileInDir));
      return
    }
  });
  fs.removeSync(path.join(getPhotosDirPath(), basePath, filename));
}

function deletePendingUploads() {
  var fs = require('fs-extra');
  var basePath = '/to-send/';
  _.filter(fs.readdirSync(path.join(getPhotosDirPath(), basePath), { withFileTypes: true }), function (f) {
    return f.isFile() && !/^\./g.test(f)
  }).map(dirent => dirent.name).forEach(fileInDir => {
      fs.removeSync(path.join(getPhotosDirPath(), basePath, fileInDir));
  });
}

app.post('/sendMail', function (req, res) {
  var emailUtils = require('@localModules/utils/emailUtils/emailUtils.js'); 
  emailUtils.sendMail(req.body.email, req.body.subject, req.body.emailBody, req.body.filename, function() {
    res.json({ ok: true })
  });
})


function isCodesAllowed(pageType) {
  return pageType == 'polaroid' || pageType == 'instax' || pageType == 'pennon' || pageType == 'mini-polaroid' || pageType == 'wide' || pageType == 'square';
}

function setCalendarParameters(req, printParameters) {
  let selectedYear = parseInt(req.query.year);
  let selectedMonth = parseInt(req.query.month);
  printParameters.selectedYear = selectedYear;
  printParameters.selectedMonth = selectedMonth;
  printParameters.padFunction = function (n, width, z = '0') {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  return printParameters;
}


function setStripParameters(req, printParameters) {
  stripsAmount = req.query.stripsAmount ? req.query.stripsAmount : 0;
  pagesAmount = req.query.pagesAmount ? req.query.pagesAmount : 0;
  if (pagesAmount > 0) {
    var pagesAmountActual = pagesAmount;
    var pagesIndex = 0;
    var pagesArray = []
    while (pagesAmountActual > 0) {
      if (printParameters.pages[pagesIndex]) {
        pagesArray.push(printParameters.pages[pagesIndex]);
        pagesIndex++;
        pagesAmountActual--;
      } else {
        pagesIndex = 0;
      }
    }
    //printParameters.pages = _.chunk(_.chunk(getPhotos(), 4), 6);
    printParameters.pages = pagesArray;
  }
  if (stripsAmount > 0 && stripsAmount <= 6) {
    printParameters.pages.forEach(page => {
      var stripsAmountActual = 0;
      var stripsIndex = 0;
      while (stripsAmountActual < stripsAmount) {
        if (!page[stripsAmountActual]) {
          if (stripsIndex >= page.length) {
            stripsIndex = 0;
          }
          page.push(page[stripsIndex]);
          stripsIndex++;
        }
        stripsAmountActual++;
      }
    });
  }
  return printParameters;
}

module.exports = {
  start: start
}
