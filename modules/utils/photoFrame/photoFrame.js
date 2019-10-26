function add(sourceUrl, complete = function(){}, proportionX = 100, proportionY = 100) {
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

function getPadding(maxSide, minSide, zeroPadding = false) {
    return zeroPadding ? 0 : (maxSide - minSide) / 2
}

function getSizeFromPercentage(maxSide, percentage) {
    return (percentage * maxSide) / 100
}

module.exports = {
    add: add
}