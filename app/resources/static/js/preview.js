var selectedPhoto;
var previousValues;

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
                <button class="btn-floating btn-small teal" onclick="save(event)"><i class="material-icons">check</i></button>
                    <button class="btn-floating btn-small grey lighten-1" style="color: #212121;" onclick="discard(event)"><i class="material-icons">clear</i></button>
                </div>
            `);
            $(this).addClass('editing');
        }
    });
});

function deselectElement() {
    $(selectedPhoto).find('.image').empty();
    $(selectedPhoto).find('.confirm-buttons').remove();
    $(selectedPhoto).removeClass('editing')
    selectedPhoto = null;
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

function print(){
    document.getElementById("printerIframe").contentWindow.print();
}

function moveUp() {
    alignPhoto($(selectedPhoto).attr('id'), 'y', 1);
    document.getElementById("printerIframe").contentWindow.moveUp($(selectedPhoto).attr('id'));
}

function moveDown() {
    alignPhoto($(selectedPhoto).attr('id'), 'y', -1);
    document.getElementById("printerIframe").contentWindow.moveDown($(selectedPhoto).attr('id'));
}

function moveLeft() {
    alignPhoto($(selectedPhoto).attr('id'), 'x', -1);
    document.getElementById("printerIframe").contentWindow.moveLeft($(selectedPhoto).attr('id'));
}

function moveRight() {
    alignPhoto($(selectedPhoto).attr('id'), 'x', 1);
    document.getElementById("printerIframe").contentWindow.moveRight($(selectedPhoto).attr('id'));
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
    document.getElementById("printerIframe").contentWindow.setValues($(selectedPhoto).attr('id'), previousValues);
    previousValues = null;
}

function savePreviousValues() {
    var photo = $(selectedPhoto).find('.image');
    previousValues = {
        x: photo.css(`background-position-x`),
        y: photo.css(`background-position-y`)
    };
}

$(document).ready(function () {
    $('.fixed-action-btn').floatingActionButton();
    $('.tooltipped').tooltip();
});