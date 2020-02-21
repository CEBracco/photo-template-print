var selectedPhoto;
var previousValues;
var printerIframe;
var invertControls = false;

$(document).ready(function(){
    $('.photo .image').click(function(e){
        if(!selectedPhoto) {
            selectedPhoto = $(this).parents('.photo')[0];
            savePreviousValues();
            addPositionButtons($(selectedPhoto).find('.image'));
            addConfirmButtons($(selectedPhoto).find('.image'));
            addRotationButtons($(selectedPhoto).find('.image'));
            $(selectedPhoto).addClass('editing');
            $('#printButton a').addClass('disabled');
        }
        e.stopPropagation();
    });
});

function addPositionButtons(imageElem) {
    invertControls=imageElem.parents('.invert-controls').length == 1;
    var xMargin = (imageElem.width() / 2) - 7.5;
    var yMargin = (imageElem.height() / 2) - 13;
    var heightMargin = imageElem.height() - 16;
    var widthMargin = imageElem.width() - 15;
    imageElem.html(`
        <div class="image-button fb-up" style="margin-top:-5px; margin-left:${xMargin}px"><i class="fas fa-chevron-circle-up" onclick="moveUp()"></i></div>
        <div class="image-button fb-right" style="margin-top:${yMargin}px; margin-left:${widthMargin}px"><i class="fas fa-chevron-circle-right" onclick="moveRight()"></i></div>
        <div class="image-button fb-left" style="margin-top:${yMargin}px"><i class="fas fa-chevron-circle-left" onclick="moveLeft()"></i></div>
        <div class="image-button fb-down" style="margin-top:${heightMargin}px; margin-left:${xMargin}px"><i class="fas fa-chevron-circle-down" onclick="moveDown()"></i></div>
    `);
}

function addConfirmButtons(imageElem) {
    imageElem.after(`
        <div class="confirm-buttons" style="position:absolute; width:${imageElem.width() + 10}px;  transform: translate(-5px, 0px); z-index: 1;">
            <button class="btn-floating btn-small pink accent-3" onclick="save(event)"><i class="material-icons">check</i></button>
            <button class="btn-floating btn-small grey lighten-1" style="color: #212121;" onclick="discard(event)"><i class="material-icons">clear</i></button>
        </div>
    `);
}

function addRotationButtons(imageElem) {
    imageElem.before(`
        <div class="confirm-buttons" style="position:absolute; width:${imageElem.width() + 50}px;  transform: translate(-20px, -35px);">
            <button class="btn-floating btn-small grey darken-3" style="color: #212121;" onclick="rotateLeft(event)"><i class="material-icons">rotate_left</i></button>
            <button class="btn-floating btn-small purple darken-3" style="color: #212121;" onclick="openTextEditor(event)" ${ isTextEditionAllowed() ? '' : 'disabled' }><i class="material-icons">text_fields</i></button>
            <button class="btn-floating btn-small deep-purple darken-3 frameOn-btn" style="color: #212121; ${ isFrameApplied() ? 'display: none;' : '' }" onclick="addFrame(event)"><i class="material-icons">blur_on</i></button>
            <button class="btn-floating btn-small deep-purple darken-3 frameOff-btn" style="color: #212121; ${ isFrameApplied() ? '' : 'display: none;' }" onclick="removeFrame(event)"><i class="material-icons">blur_off</i></button>
            <button class="btn-floating btn-small grey darken-3" style="color: #212121;" onclick="rotateRight(event)"><i class="material-icons">rotate_right</i></button>
        </div>
    `);
}

function deselectElement() {
    $(selectedPhoto).find('.image').empty();
    $(selectedPhoto).find('.confirm-buttons').remove();
    $(selectedPhoto).removeClass('editing')
    selectedPhoto = null;
    $('#printButton a').removeClass('disabled');
    invertControls=false;
}

function discard(e = null) {
    setPreviousValues();
    deselectElement();
    if (e) { e.stopPropagation();}
}

function save(e) {
    deselectElement();
    e.stopPropagation();
}

function printImage(format = 'JPEG'){
    $(".progress").show();
    $('#printButton a').addClass('disabled');
    printerIframe.printImage(format, function(){
        $(".progress").hide();
        $('#printButton a').removeClass('disabled');
    });
}

function moveUp() {
    alignPhoto($(selectedPhoto).attr('id'), 'y', 1);
}

function moveDown() {
    alignPhoto($(selectedPhoto).attr('id'), 'y', -1);
}

function moveLeft() {
    alignPhoto($(selectedPhoto).attr('id'), 'x', 1);
}

function moveRight() {
    alignPhoto($(selectedPhoto).attr('id'), 'x', -1);
}

function alignPhoto(photoId, axis, increment) {
    axis = getAxis(axis);
    var photo = $(`#${photoId} .image`)
    var valueAxis = parseInt(photo.css(`background-position-${axis}`));
    photo.css(`background-position-${axis}`, `${valueAxis + increment}%`);
    printerIframe.alignPhoto(photoId, axis, increment);
}

function setPreviousValues() {
    var photo = $(selectedPhoto).find('.image');
    photo.css(`background-position-x`, previousValues.x);
    photo.css(`background-position-y`, previousValues.y);
    printerIframe.setValues($(selectedPhoto).attr('id'), previousValues);
    previousValues = null;
}

function savePreviousValues() {
    var photo = $(selectedPhoto).find('.image');
    previousValues = {
        x: photo.css(`background-position-x`),
        y: photo.css(`background-position-y`)
    };
}

function setKeyboardEvents(){
    $(document).keydown(function (e) {
        if (selectedPhoto && isImageMoveAvaible()) {
            var keycode = e.keycode || e.which
            switch (keycode) {
                case 37: //left
                    !invertControls?moveLeft():moveDown();
                    break;
                case 38: //up
                    !invertControls?moveUp():moveLeft();
                    break;
                case 39: //right
                    !invertControls?moveRight():moveUp();
                    break;
                case 40: //down
                    !invertControls?moveDown():moveRight();
                    break;
                case 13: //enter
                    save(e);
                    break;
                case 27: //esc
                    discard(e)
                    break;
                default:
                    return true
                    break;
            }
            e.preventDefault();
        }
    })
}

function isImageMoveAvaible() {
    return $('.image-button').length != 0
}

function getAxis(axis){
    // if(invertControls){
    //     return axis == 'x'? 'y' : 'x';
    // }
    return axis;
}

function rotateRight(e) {
    rotateImage($(selectedPhoto).find('.image'), 90);
    e.stopPropagation();
}

function rotateLeft(e) {
    rotateImage($(selectedPhoto).find('.image'), -90);
    e.stopPropagation();
}

function rotateImage(photo, angle){
    $(".confirm-buttons > .btn-small").attr("disabled", true)
    var originalUrl = photo.css('background-image').replace(/url\(\"|\"\)/g, "");
    var filename = originalUrl.split('/').reverse()[0].replace(/\?.*/g, "");
    $.ajax({
        url: '/rotateImage',
        contentType: 'application/json',
        data: JSON.stringify({ 
            filename: filename, 
            angle: angle
        }),
        type: 'POST'
    }).done(function(){
        originalUrl = originalUrl.replace(/\?(?!.*\?).*/g, "");
        var newUrl = `url("${originalUrl}?v=${Math.floor(Math.random() * 100)}")`;
        newUrl = newUrl.replace(/-framed(?!.*-framed)/g, "")
        photo.css('background-image', newUrl);
        printerIframe.refreshPhoto($(selectedPhoto).attr('id'), newUrl);
        $(".confirm-buttons > .btn-small").attr("disabled", false);
        $('.frameOff-btn').hide();
        $('.frameOn-btn').show();
    });
}

function addFrame(e) {
    e.stopPropagation();
    $(".confirm-buttons > .btn-small").attr("disabled", true)
    var photo = $(selectedPhoto).find('.image');
    var originalUrl = photo.css('background-image').replace(/url\(\"|\"\)/g, "");
    var filename = originalUrl.split('/').reverse()[0].replace(/\?.*/g, "");
    $.ajax({
        url: '/addFrame',
        contentType: 'application/json',
        data: JSON.stringify({
            filename: filename,
            type: pageType
        }),
        type: 'POST'
    }).done(function () {
        originalUrl = originalUrl.replace(/\?(?!.*\?).*/g, "");
        var newUrl = `url("${originalUrl}?v=${Math.floor(Math.random() * 100)}")`;
        newUrl = newUrl.replace(/-framed(?!.*-framed)/g, "")
        newUrl = newUrl.replace(/photos(?!.*photos)/g, "photos-framed")
        photo.css('background-image', newUrl);
        printerIframe.refreshPhoto($(selectedPhoto).attr('id'), newUrl);
        $(".confirm-buttons > .btn-small").attr("disabled", false);
        $('.frameOn-btn').hide();
        $('.frameOff-btn').show();
    });
}

function removeFrame(e) {
    e.stopPropagation();
    var photo = $(selectedPhoto).find('.image');
    var originalUrl = photo.css('background-image').replace(/url\(\"|\"\)/g, "");
    originalUrl = originalUrl.replace(/\?(?!.*\?).*/g, "");
    var newUrl = `url("${originalUrl}?v=${Math.floor(Math.random() * 100)}")`;
    newUrl = newUrl.replace(/-framed(?!.*-framed)/g, "")
    photo.css('background-image', newUrl);
    printerIframe.refreshPhoto($(selectedPhoto).attr('id'), newUrl);
    $('.frameOff-btn').hide();
    $('.frameOn-btn').show();
}

function isFrameApplied() {
    var photo = $(selectedPhoto).find('.image');
    var url = photo.css('background-image').replace(/url\(\"|\"\)/g, "");
    return url.match(/-framed(?!.*-framed)/g);
}

function openTextEditor(e){
    var tmpSelectedPhoto = selectedPhoto;
    discard(e)
    $(tmpSelectedPhoto).find('.text').trigger('click')
}

var selectedPaper;
$(document).ready(function(params) {
    $('.paper').click(function (e) {
        e.stopPropagation();
        if (!selectedPhoto) {
            selectedPaper = this;
            $('#background-selector').modal('open');
        }
    });
    $('.design').click(function() {
        var backgroundImageValue = $(this).data('filename') ? `url("/backgroundStyles/${$(this).data('filename')}")` : 'none';
        $(selectedPaper).css('background-image', backgroundImageValue);
        printerIframe.setBackgroundImage($(selectedPaper).attr('id'), backgroundImageValue);
        $('#background-selector').modal('close');
    });
});

$(document).ready(function () {
    $('.fixed-action-btn').floatingActionButton();
    $('.tooltipped').tooltip();
    $('.modal').modal();
    $('.color-field input').spectrum({ 
        showAlpha: true, 
        showInput: true,
        theme: "sp-dark", 
        preferredFormat: "rgb"
    });
    Zoomerang.config({
        maxHeight: $(window).height() - 50,
        maxWidth: $(window).width() - 50,
        bgColor: '#000',
        bgOpacity: .85
    }).listen('.page');
    printerIframe = document.getElementById("printerIframe").contentWindow;
    setKeyboardEvents();
});

$(document).ready(function () {
    $('.textfield-field > textarea, .number-field input, .select-field select, .color-field input').change(refreshStyleChanges);
    $('.textfield-field > textarea').on('keyup', refreshStyleChanges);
})

function refreshStyleChanges() {
    var cssProperty = $(this).data('cssElementProperty').split('|')[0];
    var elementClass = $(this).data('cssElementProperty').split('|')[1];
    var elementType = $(this).data('cssElementProperty').split('|')[2];
    window[elementType + "PreviewChanges"](elementClass, cssProperty, $(this).val())
}

function isTextEditionAllowed() {
    return pageType == 'polaroid' || pageType == 'instax' || pageType == 'pennon';
}