function print(){
    $('.page').each(function(index){
        domtoimage.toBlob(this)
            .then(function (blob) {
                window.saveAs(blob, `photo-${index}.png`);
            });
    });
}

function moveUp(photoId) {
    alignPhoto(photoId, 'y', 1);
}

function moveDown(photoId) {
    alignPhoto(photoId, 'y', -1);
}

function moveLeft(photoId) {
    alignPhoto(photoId, 'x', -1);
}

function moveRight(photoId) {
    alignPhoto(photoId, 'x', 1);
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