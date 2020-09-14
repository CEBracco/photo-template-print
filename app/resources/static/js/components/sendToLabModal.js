var sendToLabModal = null;
var labFileToSend = null;
var sendToLabModalOptions = {
    onOpenStart: function () {
        listUploads()
        createUploadToLabConnection()
    },
    onCloseStart: function () {
        closeUploadToLabConnection()
        setAmountOfCompleted()
    },
    onCloseEnd: function () {
        if (labFileToSend) {
            openMailModal(labFileToSend)
            labFileToSend = null;
        }
    }
}
$(document).ready(function () {
    var elem = document.querySelector('#send-to-lab-modal');
    sendToLabModal = M.Modal.init(elem, sendToLabModalOptions);
    loadUploadItemTemplates()
})

function openSendToLabModal() {
    sendToLabModal.open();
}

function listUploads() {
    $('.upload-list').empty();
    $.ajax({
        url: '/labUploads',
        contentType: 'application/json',
        type: 'POST'
    }).done(function (res) {
        if(res.ok) {
            res.pending.length == 0 ? $('.upload-badge').addClass('hide') : $('.upload-badge').removeClass('hide');
            $('.upload-badge small').text(res.pending.length);
            
            res.uploads.forEach(upload => {
                appendUpload(upload)
            });
            res.pending.forEach(upload => {
                appendPending(upload)
            });
            res.completed.forEach(upload => {
                appendCompleted(upload)
            });
        }
    })
}

var uploadItemTemplate;
var uploadItemPendingTemplate;
var uploadItemCompletedTemplate;
function loadUploadItemTemplates() {
    uploadItemTemplate = $('#order-upload-template').html();
    uploadItemPendingTemplate = $('#order-upload-pending-template').html();
    uploadItemCompletedTemplate = $('#order-upload-completed-template').html();
    Mustache.parse(uploadItemTemplate);
    Mustache.parse(uploadItemPendingTemplate);
    Mustache.parse(uploadItemCompletedTemplate);
}

function appendUpload(upload) {
    var rendered = Mustache.render(uploadItemTemplate, { upload: upload, uploadId: upload.replace(/\./, '') });
    $('.upload-list').append(rendered)
}

function appendPending(upload) {
    var rendered = Mustache.render(uploadItemPendingTemplate, { upload: upload, uploadId: upload.replace(/\./, '') });
    $('.upload-list').append(rendered)
}

function appendCompleted(upload) {
    var rendered = Mustache.render(uploadItemCompletedTemplate, { upload: upload, uploadId: upload.replace(/\./, '') });
    $('.upload-list').append(rendered)
}

function showUploadStatus(file, progress) {
    var roundedPercentage = Math.round(progress);
    var fileId = file.replace(/\./, '');
    $(`#${fileId} .details`).removeClass('hide');
    $(`#${fileId} .details .progress-percentage`).text(`${roundedPercentage}%`);
    $(`#${fileId} .progress .determinate`).css('width', `${roundedPercentage}%`);
    $(`#${fileId} .progress`).removeClass('hide');
}

var uploadToLabSocket;
var uploadToLabSocketAutoReconnect = false;
function createUploadToLabConnection() {
    
    uploadToLabSocketAutoReconnect = true;
    uploadToLabSocket = new WebSocket(`ws://${window.location.host}`);

    uploadToLabSocket.onopen = function (e) {
        console.log("[open] uploadToLab Connection established");
    };

    uploadToLabSocket.onmessage = function (event) {
        console.log(`[message] uploadToLab Data received from server: ${event.data}`);
        var data = JSON.parse(event.data)
        if (data.type) {
            switch (data.type) {
                case "uploadToLabProgress":
                    showUploadStatus(data.file, data.progress)
                    break;
                case "uploadToLabComplete":
                    listUploads()
                    break;
                default:
                    break;
            }
        }
    };

    uploadToLabSocket.onclose = function (event) {
        console.log('[close] uploadToLab Connection died');
        //retry connection
        if (uploadToLabSocketAutoReconnect) {
            setTimeout(function () { createUploadToLabConnection() }, 5000);
        }
    };

    uploadToLabSocket.onerror = function (error) {
        console.log(`[error] ${error.message}`);
    };
}

function closeUploadToLabConnection() {
    uploadToLabSocketAutoReconnect = false;
    uploadToLabSocket.close()
}

function deleteUpload(element) {
    var filename = $(element).parents('li').data('upload');
    $.ajax({
        url: '/deleteLabUpload',
        data: JSON.stringify({ 
            filename: filename
        }),
        contentType: 'application/json',
        type: 'POST'
    }).done(function (res) {
        if (res.ok) {
            $(element).parents('li').remove()
        }
    })
}

function goToMailModal(selectedLabFile) {
    labFileToSend = selectedLabFile;
    sendToLabModal.close();
}