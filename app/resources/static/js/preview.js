var selectedPhoto;
var previousValues;
var printerIframe;
var invertControls = false;

$(document).ready(function(){
    $('.photo').click(function(){
        if(!selectedPhoto) {
            selectedPhoto = this;
            savePreviousValues();
            addPositionButtons($(this).find('.image'));
            addConfirmButtons($(this).find('.image'));
            $(this).addClass('editing');
            $('#printButton a').addClass('disabled');
        }
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
                    moveLeft();
                    break;
                case 38: //up
                    moveUp();
                    break;
                case 39: //right
                    moveRight();
                    break;
                case 40: //down
                    moveDown();
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
    if(invertControls){
        return axis == 'x'? 'y' : 'x';
    }
    return axis;
}

$(document).ready(function () {
    $('.fixed-action-btn').floatingActionButton();
    $('.tooltipped').tooltip();
    printerIframe = document.getElementById("printerIframe").contentWindow;
    setKeyboardEvents();
});
