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
        <div class="confirm-buttons">
            <button class="btn-floating btn-small pink accent-3" onclick="save(event)"><i class="material-icons">check</i></button>
            <button class="btn-floating btn-small grey lighten-1" style="color: #212121;" onclick="discard(event)"><i class="material-icons">clear</i></button>
        </div>
    `);
}

function addRotationButtons(imageElem) {
    imageElem.before(`
        <div class="confirm-buttons" style="position:absolute; width:${imageElem.width()}px;  transform: translate(0px, -35px);">
            <button class="btn-floating btn-small grey darken-3" style="color: #212121;" onclick="rotateLeft(event)"><i class="material-icons">rotate_left</i></button>
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

function discard(e) {
    setPreviousValues();
    deselectElement();
    e.stopPropagation();
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
        if (selectedPhoto) {
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
                    break;
            }
            e.preventDefault();
        }
    })
}

function getAxis(axis){
    // if(invertControls){
    //     return axis == 'x'? 'y' : 'x';
    // }
    return axis;
}

function rotateRight(e) {
    rotateImage($(selectedPhoto).find('.image'), -90);
    e.stopPropagation();
}

function rotateLeft(e) {
    rotateImage($(selectedPhoto).find('.image'), 90);
    e.stopPropagation();
}

function rotateImage(photo, angle){
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
        var newUrl = `url("${originalUrl}?v=${Math.floor(Math.random() * 100)}")`;
        photo.css('background-image', newUrl);
        printerIframe.refreshPhoto($(selectedPhoto).attr('id'), newUrl);
    });
}

var selectedPaper;
$(document).ready(function(params) {
    $('.paper').click(function (e) {
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
    printerIframe = document.getElementById("printerIframe").contentWindow;
    setKeyboardEvents();
});
