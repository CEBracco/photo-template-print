var selectedPhoto;
var previousValues;
var printerIframe;

$(document).ready(function(){
    $('.photo').click(function(){
        if(!selectedPhoto) {
            selectedPhoto = this;
            savePreviousValues();
            $(this).find('.image').html(`
                <div class="image-button fb-up"><i class="fas fa-chevron-circle-up" onclick="moveUp()"></i></div>
                <div class="image-button fb-right"><i class="fas fa-chevron-circle-up" onclick="moveRight()"></i></div>
                <div class="image-button fb-left"><i class="fas fa-chevron-circle-up" onclick="moveLeft()"></i></div>
                <div class="image-button fb-down"><i class="fas fa-chevron-circle-up" onclick="moveDown()"></i></div>
            `);
            $(this).find('.image').after(`
                <div class="confirm-buttons">
                <button class="btn-floating btn-small pink accent-3" onclick="save(event)"><i class="material-icons">check</i></button>
                    <button class="btn-floating btn-small grey lighten-1" style="color: #212121;" onclick="discard(event)"><i class="material-icons">clear</i></button>
                </div>
            `);
            $(this).addClass('editing');
            $('#printButton a').addClass('disabled');
        }
    });
});

function deselectElement() {
    $(selectedPhoto).find('.image').empty();
    $(selectedPhoto).find('.confirm-buttons').remove();
    $(selectedPhoto).removeClass('editing')
    selectedPhoto = null;
    $('#printButton a').removeClass('disabled');
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
    printerIframe.moveUp($(selectedPhoto).attr('id'));
}

function moveDown() {
    alignPhoto($(selectedPhoto).attr('id'), 'y', -1);
    printerIframe.moveDown($(selectedPhoto).attr('id'));
}

function moveLeft() {
    alignPhoto($(selectedPhoto).attr('id'), 'x', 1);
    printerIframe.moveLeft($(selectedPhoto).attr('id'));
}

function moveRight() {
    alignPhoto($(selectedPhoto).attr('id'), 'x', -1);
    printerIframe.moveRight($(selectedPhoto).attr('id'));
}

function alignPhoto(photoId, axis, increment) {
    var photo = $(`#${photoId} .image`)
    var valueAxis = parseInt(photo.css(`background-position-${axis}`));
    photo.css(`background-position-${axis}`, `${valueAxis + increment}%`);
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
        }
    })
}

$(document).ready(function () {
    $('.fixed-action-btn').floatingActionButton();
    $('.tooltipped').tooltip();
    printerIframe = document.getElementById("printerIframe").contentWindow;
    setKeyboardEvents();
});
