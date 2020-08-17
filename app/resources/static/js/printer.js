function printImage(format = 'JPEG', complete = function(){}, suscribersSelector = null) {
    var totalPages = $('.page').length
    var pagesProcessed = 0;
    var saveFunction = getSaveFunction(format, totalPages);
    $('.page').each(function (index) {
        generateImageBlob(this, format, function (blob) {
            var oldIndex = `photo-${index}.jpeg`
            var uuid = `photo-${new Date().getTime()}${index}.jpeg`
            saveFunction(blob, uuid, totalPages, function(data){
                pagesProcessed++;
                if (pagesProcessed < totalPages){
                    $(suscribersSelector).trigger('fileProcessed');
                } else {
                    $(suscribersSelector).trigger('processCompleted');
                    complete(data);
                }
            });
        });
    });
}

function getSaveFunction(format, totalPages) {
    if (format == 'lab') {
        return uploadToServer;
    } else {
        return totalPages > 1 ? zipIt : downloadDirectly;
    }
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

var fd = new FormData();
var appendedFilesCounter = 0
function uploadToServer(blob, filename, filesAmount, complete) {
    appendedFilesCounter++;
    if (appendedFilesCounter < filesAmount) {
        fd.append('photos', blob);
        complete();
    } else {
        fd.append('photos', blob);
        $.ajax({
            type: 'POST',
            url: '/uploadToSend',
            data: fd,
            processData: false,
            contentType: false
        }).done(function (data) {
            fd = new FormData();
            appendedFilesCounter = 0
            complete(data);
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
    var paper = paperId ? $(`#${paperId}`) : $('.paper');
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

//Texts logic
function setTextProperties(photoId, properties, applyToAll) {
    if (applyToAll) {
        if (properties.cssProperty == 'html-content') {
            $('.' + properties.elementClass).html(properties.cssValue.replace(/\r?\n/g, '<br>'));
        } else {
            $('.' + properties.elementClass).css(properties.cssProperty, properties.cssValue);
        }
    } else {
        if (properties.cssProperty == 'html-content') {
            $(`#${photoId} .text-container`)
                .find('.' + properties.elementClass)
                .addBack('.' + properties.elementClass)
                .html(properties.cssValue.replace(/\r?\n/g, '<br>'));
        } else {
            $(`#${photoId} .text-container`)
                .find('.' + properties.elementClass)
                .addBack('.' + properties.elementClass)
                .css(properties.cssProperty, properties.cssValue);
        }
    }
}

function restoreTextProperties(textsProperties) {
    if (textsProperties) {
        $('.photo .text-container').each(function (index) {
            var textProperties = textsProperties[index];
            for (const property in textProperties) {
                if (textProperties.hasOwnProperty(property)) {
                    const style = textProperties[property];
                    const cssProperty = property.split('|')[0];
                    const propertyElement = property.split('|')[1];
                    if (cssProperty == 'html-content') {
                        $(this).find('.' + propertyElement).addBack('.' + propertyElement).html(style.replace(/\r?\n/g, '<br>'));
                    } else {
                        $(this).find('.' + propertyElement).addBack('.' + propertyElement).css(cssProperty, getRealCssValue(cssProperty, style, 10));
                    }
                }
            }
        })
    }
}

function getRealCssValue(cssProperty, cssValue, scale = 1) {
    switch (cssProperty) {
        case 'font-size':
            cssValue = parseFloat(cssValue);
            return `calc(${cssValue}px * ${scale})`;
        case 'padding-top':
            cssValue = parseFloat(cssValue);
            return `calc(${cssValue}px * ${scale})`;
        case 'line-height':
            cssValue = parseFloat(cssValue);
            return cssValue;
        case 'padding':
            cssValue = parseFloat(cssValue);
            return `calc(${cssValue}px * ${scale})`;
        case 'border-radius':
            cssValue = parseFloat(cssValue);
            return `calc(${cssValue}px * ${scale})`;
        default:
            return cssValue
    }
}

//Code logic
function setCodeProperties(properties, photoId = null) {
    properties.forEach(property => {     
        if (property.cssProperty != 'input-value') {
            if (photoId == null) { //set to all
                $('.' + property.elementClass).css(property.cssProperty, property.cssValue);
            } else {
                $(`#${photoId} .code-container`)
                    .find('.' + property.elementClass)
                    .addBack('.' + property.elementClass)
                    .css(property.cssProperty, property.cssValue);
            }
        }
    });
}

var backuppedCodeProperties = []
function backupCodeProperties(photoId = null) {
    backuppedCodeProperties = [];
    var photoSelector = photoId ? `#${photoId}` : '.photo';
    $(photoSelector).each(function () {
        backuppedCodeProperties.push([
            {
                elementClass: 'code-container',
                cssProperty: 'display',
                cssValue: $(this).find('.code-container').css('display')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'border-radius',
                cssValue: $(this).find('.code-container').css('border-radius')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'background-color',
                cssValue: $(this).find('.code-container').css('background-color')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'height',
                cssValue: $(this).find('.code-container').css('height')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'width',
                cssValue: $(this).find('.code-container').css('width')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'bottom',
                cssValue: $(this).find('.code-container').css('bottom')
            },
            {
                elementClass: 'code',
                cssProperty: 'background-image',
                cssValue: $(this).find('.code').css('background-image')
            }
        ]);
    })
}

function restoreProperties(photoId = null) {
    var photoSelector = photoId ? `#${photoId}` : '.photo';
    $(photoSelector).each(function (index) {
        setCodeProperties(backuppedCodeProperties[index], `${$(this).attr('id')}`)
    })
}