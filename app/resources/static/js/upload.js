$(document).ready(function(){
    $(".file-uploader").dropzone({ 
        url: "/upload",
        acceptedFiles: "image/*",
        parallelUploads: 50,
        paramName: "photo",
        autoProcessQueue: false,
        clickable: ".upload-button",
        previewsContainer: ".file-list",
        previewTemplate: `
            <li class="collection-item avatar">
                <img class="circle" data-dz-thumbnail>
                <span class="title"><span data-dz-name></span></span>
                <p class="details" data-dz-size></p>
                <a href="#!" class="secondary-content" data-dz-remove><i class="material-icons">clear</i></a>
            </li>
        `,
        dragenter: function(){
            $(".file-uploader").addClass("dragging");
        },
        dragleave: function(){
            $(".file-uploader").removeClass("dragging");
        },
        drop: function(){
            $(".file-uploader").removeClass("dragging");
        },
        init: function () {
            this.on("addedfile", function () {
                $('.empty-files-alert').fadeOut();
                $('.file-list-container').fadeIn();
            });
            this.on("reset", function () {
                $('.file-list-container').fadeOut();
                $('.empty-files-alert').fadeIn();
            });
            this.on("queuecomplete", function(){
                processPhotosAndComplete()
            });
            this.on("processing", function(a){
                console.log(a);
            });
            this.on("totaluploadprogress",function(progress){
                $(".file-uploader .progress").show();
                $(".file-uploader .progress .determinate").css("width",`${progress}%`);
            })
            this.on("removedfile", function () {
                $(".file-uploader .progress").hide();
            });
        }
    });

    $('.clear-button').click(function(){
        $(".file-uploader")[0].dropzone.removeAllFiles(true);
        $(".collection-item.saved").each(function () {
            removePhotoItem($(this));
        })
    });

    $('.confirm-upload').click(function(){
        if ($(".file-uploader")[0].dropzone.getQueuedFiles().length > 0) {
            $(".file-uploader")[0].dropzone.processQueue();
        } else {
            if ($('.collection.file-list .collection-item').length > 0) {
                processPhotosAndComplete()
            }
        }
    });

    $('.get-from-order').click(function(){
        getWebformParameters(function() {
            listOrders()
            $('#order-list').modal('open');
        }, function() {
            //prompt for configuration
            $('#webform-config-modal').modal('open')
        })
    })

    $('.btn-save-webformconfig').click(function() {
        var webformURL = $('#webform_url').val().trim();
        var webformToken = $('#webform_token').val().trim();
        if(webformURL && webformURL != '' && webformToken && webformToken != '') {
            saveWebformConfig({
                url: webformURL,
                token: webformToken
            }, function() {
                $('#webform-config-modal').modal('close');
                setTimeout(function() {
                    $('.get-from-order').trigger('click');
                }, 1000)
            })
        }
    })

    $('#webform-config-modal').modal();
    $('#order-list').modal();
});

function downloadOrder(orderId) {
    $('#order-list').modal('close');
    OrderService.download({orderHash: orderId}, function(res) {
        if (res.ok) {
            res.data.forEach(file => {
                addPhotoItem(file.name)
            });
        }
    })
}

function addPhotoItem(filename) {
    $('.file-list').append(` 
    <li class="collection-item saved avatar" data-photo="${filename}">
        <img class="circle" style="background: url('/photos/${filename}') center no-repeat; background-size: cover;">
        <span class="title"><span>${filename}</span></span>
        <p class="details"></p>
        <a href="#!" class="secondary-content" onclick="onDeletePhotoButton(this)"><i class="material-icons">clear</i></a>
    </li>
    `)
    $('.empty-files-alert').fadeOut();
    $('.file-list-container').fadeIn();
}

function processPhotosAndComplete() {
    $.ajax({
        url: "/processPhotos",
        method: "POST"
    }).done(function () {
        window.location.href = "format_selection";
    });
}

function removePhotoItem(photoItem) {
    var filename = photoItem.data("photo")
    $.ajax({
        url: "/deletePhoto",
        contentType: 'application/json',
        data: JSON.stringify({ filename: filename }),
        method: "POST"
    }).done(function (res) {
        if (res.ok) {
            photoItem.remove();
            if ($('.collection.file-list .collection-item').length == 0) {
                $('.file-list-container').fadeOut();
                $('.empty-files-alert').fadeIn();
            }
        }
    });
}

function onDeletePhotoButton(button) {
    removePhotoItem($(button).closest('.collection-item'));
}

function onSaveWebformConfigButton() {
    
}