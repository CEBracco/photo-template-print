$(document).ready(function() {
    setPaceOptions();
})

function setPaceOptions(){
    var interval = setInterval(function() {
        if (window.Pace) {
            Pace.options.ajax.trackMethods = ['GET', 'POST'];
            Pace.options.ajax.trackWebSockets = false;
            clearInterval(interval)
        }
    }, 2000);
}

function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return blob;

}

Date.prototype.formatDateTime = function () {
    return `${paddingTwoZeroNumber(this.getDate())}/${paddingTwoZeroNumber(this.getMonth() + 1)}/${this.getFullYear()} ${paddingTwoZeroNumber(this.getHours())}:${paddingTwoZeroNumber(this.getMinutes())}`
}
function paddingTwoZeroNumber(number) {
    if ((number + '').length == 1) {
        return '0' + number
    }
    return number + ''
}

var webformConfig;
function getWebformParameters(success, error) {
    if (webformConfig) {
        success(webformConfig)
    } else {
        $.ajax({
            url: '/webformConfig',
            contentType: 'application/json',
            type: 'POST'
        }).done(function (res) {
            if (res.ok) {
                webformConfig = res.data
                success(res.data)
            } else {
                error();
            }
        })
    }
}

function saveWebformConfig(config, success, error = function () {}) {
    $.ajax({
        url: "/saveWebformConfig",
        contentType: 'application/json',
        data: JSON.stringify({ url: config.url, token: config.token }),
        method: "POST"
    }).done(function (res) {
        if (res.ok) {
            success()
        } else {
            error()
        }
    });
}

function trim(str) {
    return str.replace(/^\s+|\s+$/gm, '');
}

function rgbaToHex(rgba) {
    var inParts = rgba.substring(rgba.indexOf("(")).split(","),
        r = parseInt(trim(inParts[0].substring(1)), 10),
        g = parseInt(trim(inParts[1]), 10),
        b = parseInt(trim(inParts[2]), 10),
        alpha = inParts[3] ? trim(inParts[3]) : trim('1.0'),
        a = parseFloat(trim(alpha.substring(0, alpha.length - 1))).toFixed(2);
    var outParts = [
        r.toString(16),
        g.toString(16),
        b.toString(16),
        Math.round(a * 255).toString(16).substring(0, 2)
    ];

    // Pad single-digit output values
    outParts.forEach(function (part, i) {
        if (part.length === 1) {
            outParts[i] = '0' + part;
        }
    })

    return ('#' + outParts.join(''));
}

function ContextMenus() {
    console.log("context menu called");
}