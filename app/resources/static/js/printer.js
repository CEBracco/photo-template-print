function printImage(format = 'JPEG', complete = function(){}, suscribersSelector = null) {
    var totalPages = $('.page').length
    var pagesProcessed = 0;
    var saveFunction = totalPages > 1 ? zipIt : downloadDirectly;
    $('.page').each(function (index) {
        generateImageBlob(this, format, function (blob) {
            saveFunction(blob, `photo-${index}.jpeg`, totalPages, function(){
                pagesProcessed++;
                if (pagesProcessed < totalPages){
                    $(suscribersSelector).trigger('fileProcessed');
                } else {
                    $(suscribersSelector).trigger('processCompleted');
                    complete();
                }
            });
        });
    });
}

function generateImageBlob(element, format, complete){
    if(format == 'JPEG'){
        domtoimage.toJpeg(element)
            .then(function (dataUrl) {
                complete(dataURItoBlob(dataUrl));
        });
    } else {
        domtoimage.toBlob(element)
            .then(function (blob) {
                complete(blob)
        });
    }
}

function downloadDirectly(blob, filename, filesAmount = 0, complete){
    saveAs(blob, filename);
    complete();
}

var zipFilesCounter = 0;
var zip = new JSZip();
function zipIt(blob, filename, filesAmount, complete){
    zipFilesCounter++;
    if (zipFilesCounter < filesAmount){
        zip.file(filename, blob);
        complete();
    } else {
        zip.file(filename, blob);
        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                saveAs(content, "photos.zip");
                zipFilesCounter = 0;
                zip = new JSZip();
                complete();
            });
    }
}

function moveUp(photoId) {
    alignPhoto(photoId, 'y', 1);
}

function moveDown(photoId) {
    alignPhoto(photoId, 'y', -1);
}

function moveLeft(photoId) {
    alignPhoto(photoId, 'x', 1);
}

function moveRight(photoId) {
    alignPhoto(photoId, 'x', -1);
}

function alignPhoto(photoId, axis, increment) {
    var photo = $(`#${photoId} .image`)
    var valueAxis = parseInt(photo.css(`background-position-${axis}`));
    photo.css(`background-position-${axis}`, `${valueAxis + increment}%`);
}

function setValues(photoId, values) {
    var photo = $(`#${photoId} .image`);
    photo.css(`background-position-x`, values.x);
    photo.css(`background-position-y`, values.y);
}

function refreshPhoto(photoId, newUrl) {
    var photo = $(`#${photoId} .image`);
    photo.css('background-image', newUrl);
}

function setBackgroundImage(paperId, backgroundImageValue) {
    var paper = $(`#${paperId}`);
    paper.css('background-image', backgroundImageValue);
}

//Calendars logic

function setCalendarProperties(photoId, properties, applyToAll) {
    if (applyToAll) {
        $('.' + properties.elementClass).css(properties.cssProperty, properties.cssValue);
    } else {
        $(`#${photoId} .polly-calendar`)
            .find('.' + properties.elementClass)
            .addBack('.' + properties.elementClass)
            .css(properties.cssProperty, properties.cssValue);
    }
}

function restoreCalendarsProperties(calendarsProperties) {
    $('.polly-calendar').each(function (index) {
        var calendarProperties = calendarsProperties[index];
        for (const property in calendarProperties) {
            if (calendarProperties.hasOwnProperty(property)) {
                const style = calendarProperties[property];
                const cssProperty = property.split('|')[0];
                const propertyElement = property.split('|')[1];
                $(this).find('.' + propertyElement).addBack('.' + propertyElement).css(cssProperty, style);
            }
        }
    })
}