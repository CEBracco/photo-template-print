function createConnection() {
    var socket = new WebSocket("ws://localhost:3000");

    socket.onopen = function (e) {
        console.log("[open] Connection established");
    };

    socket.onmessage = function (event) {
        console.log(`[message] Data received from server: ${event.data}`);
        var data = JSON.parse(event.data)
        if (data.type) {
            switch (data.type) {
                case "downloadStatus":
                    showDownloadStatus(data.progress)
                    break;
                case "updateReady":
                    showUpdateReady()
                    break;
                default:
                    break;
            }
        }
    };

    socket.onclose = function (event) {
        console.log('[close] Connection died');
        //retry connection
        setTimeout(function () { createConnection() }, 5000);
    };
    
    socket.onerror = function (error) {
        console.log(`[error] ${error.message}`);
    };
}

function showDownloadStatus(progress) {
    $(".version-info .download-status .progress .determinate").css('width', progress + '%');
    $(".version-info .download-status .progress-percentage").text(progress + '%');
    $(".version-info .download-status").removeClass('hide');
}
function showUpdateReady() {
    $(".version-info .download-status").addClass('hide');
    $(".version-info .update-ready").removeClass('hide');
}

$(document).ready(function() {
    createConnection()
})