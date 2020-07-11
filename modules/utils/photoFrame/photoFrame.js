var optimal = true

function add(sourceUrl, complete = function(){}, proportionX = 100, proportionY = 100) {
    if (optimal) {
        addOptimal(sourceUrl, complete, proportionX, proportionY)
    } else {
        addOld(sourceUrl, complete, proportionX, proportionY)
    }
}

function addOld(sourceUrl, complete = function () { }, proportionX = 100, proportionY = 100) {
    var Jimp = require('jimp');
    Jimp.read(sourceUrl, (err, backgroundImage) => {
        if (err) throw err;
        var image = backgroundImage.clone();
        var verticalImage = backgroundImage.getHeight() > backgroundImage.getWidth()
        var horizontalImage = !verticalImage
        var maxSide = verticalImage ? backgroundImage.getHeight() : backgroundImage.getWidth();
        var minSide = verticalImage ? backgroundImage.getWidth() : backgroundImage.getHeight();
        backgroundImage.cover(maxSide, maxSide, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

        if (proportionX != 100 || proportionY != 100) {
            backgroundImage.crop(0, 0, getSizeFromPercentage(maxSide, proportionX), getSizeFromPercentage(maxSide, proportionY));
            image.scaleToFit(backgroundImage.getWidth(), Jimp.AUTO);
            minSide = image.getHeight();
            horizontalImage = true;
            verticalImage = false;
        }

        backgroundImage.blur(9);
        backgroundImage.composite(image, getPadding(maxSide, minSide, horizontalImage), getPadding(maxSide, minSide, verticalImage));
        complete(backgroundImage)
    })
}

function addOptimal(sourceUrl, complete = function () { }, proportionX = 100, proportionY = 100) {
    var fs = require('fs-extra');
    const sharp = require('sharp');
    sharp.cache(false)
    var backgroundImage = sharp(sourceUrl)
    backgroundImage.metadata().then(info => {
        var image = backgroundImage.clone();
        var verticalImage = info.height > info.width
        var horizontalImage = !verticalImage
        var maxSide = verticalImage ? info.height : info.width
        var minSide = verticalImage ? info.width : info.height;

        backgroundImage
            .resize(Math.round(getSizeFromPercentage(maxSide, proportionX)), Math.round(getSizeFromPercentage(maxSide, proportionY)), {
                fit: "cover"
            })
            .blur(25)
        
        if (proportionX != 100 || proportionY != 100) {
            var maxPercentageSize = proportionX < proportionY ? proportionX : proportionY;
            var isVerticalPercentageSize = proportionX < proportionY
            var proportionalSizes = getProportionalSizes(isVerticalPercentageSize, getSizeFromPercentage(maxSide, maxPercentageSize), info)
            image
                .resize(proportionalSizes.width, proportionalSizes.height, { fit: "contain" })
        }
        
        image.toBuffer().then(function (imageBuffer) {
            backgroundImage.composite([{
                input: imageBuffer,
                blend: "over"
            }])
            complete(backgroundImage)
        })
    })
}

function getProportionalSizes(isVerticalImage, maxSide, imageInfo) {
    var origHeight = imageInfo.height
    var origWidth = imageInfo.width
    var height = null
    var width = null
    if (!isVerticalImage) {
        height = Math.floor(maxSide)
        // width = (origWidth * height) / origHeight
    } else {
        width = Math.floor(maxSide)
        // height = (origHeight * width) / origWidth
    }
    return { height: height, width: width }
}

function getPadding(maxSide, minSide, zeroPadding = false) {
    return zeroPadding ? 0 : (maxSide - minSide) / 2
}

function getSizeFromPercentage(maxSide, percentage) {
    return (percentage * maxSide) / 100
}

function toFile(photo, path, complete) {
    if (optimal) {
        photo.toFile(path, () => {
            complete()
        })
    } else {
        photo.write(path);
        complete()
    }
}

module.exports = {
    add: add,
    toFile: toFile
}