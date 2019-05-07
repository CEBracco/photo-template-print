function print(){
    $('.page').each(function(){
        domtoimage.toBlob(this)
            .then(function (blob) {
                window.saveAs(blob, 'template.png');
            });
    });
}