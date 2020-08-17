var editingCodePhotoId = null

var codeModal = null;
var codeModalOptions = {
    preventScrolling: false,
    opacity: 0,
    dismissible: false,
    onOpenStart: function() {
        $('main').append(`<div class="scroller-spacer" style="height: ${$('#code-modal').height()}px"></div>`);
        backupCodeProperties()
        previewCode()
    },
    onCloseStart: function() {
        $('main .scroller-spacer').remove();
        editingCodePhotoId = null
    }
}
$(document).ready(function () {
    var elem = document.querySelector('#code-modal');
    codeModal = M.Modal.init(elem, codeModalOptions);
    $('.code-color-field input').spectrum({
        showAlpha: true,
        showInput: true,
        theme: "sp-dark",
        preferredFormat: "rgb"
    });

    $('.code-container').click(function(e){
        e.stopPropagation();
        idPhoto = $(this).parents('.photo').attr('id')
        openCodeModal(idPhoto)
    })
})

function openCodeModal(idPhoto = null) {
    if(idPhoto) {
        editingCodePhotoId = idPhoto;
        setModalCodeState(idPhoto)
    }
    codeModal.open();
}

function previewCode() {
    $.ajax({
        url: '/previewCode',
        contentType: 'application/json',
        data: JSON.stringify({
            content: $('#code-content-input').val(),
            dotsColor: $('#code-color').val() ? rgbaToHex($('#code-color').val()) : '#000'
        }),
        type: 'POST'
    }).done(function (res) {
        if(res.ok) {
            $('.preview-code-container .preview-code').css('background-image',`url("data:image/svg+xml;base64, ${res.data}")`)
            $('#code-shape-input').prop('checked') ? $('.preview-code-container').css('border-radius', '50%') : $('.preview-code-container').css('border-radius', '0');
            $('.preview-code-container').css('background-color', $('#code-background-color').val());
            applyCode(res.data, editingCodePhotoId)
        }
    })
}

function applyCode(data, photoId = null) {
    var properties = [
        {
            elementClass: 'code-container',
            cssProperty: 'display',
            cssValue: $('#code-enable-input').prop('checked') ? 'inline-block' : 'none'
        },
        {
            elementClass: 'code-container',
            cssProperty: 'border-radius',
            cssValue: $('#code-shape-input').prop('checked') ? '50%' : '0'
        },
        {
            elementClass: 'code-container',
            cssProperty: 'background-color',
            cssValue: $('#code-background-color').val()
        },
        {
            elementClass: 'code-container',
            cssProperty: 'height',
            cssValue: `calc(${$('#code-size-input').val()}px * var(--print-multiplier))`
        },
        {
            elementClass: 'code-container',
            cssProperty: 'width',
            cssValue: `calc(${$('#code-size-input').val()}px * var(--print-multiplier))`
        },
        {
            elementClass: 'code-container',
            cssProperty: 'bottom',
            cssValue: `calc(${$('#code-vertical-input').val()}px * var(--print-multiplier))`
        },
        {
            elementClass: 'code',
            cssProperty: 'background-image',
            cssValue: `url("data:image/svg+xml;base64, ${data}")`
        },
        {
            elementClass: 'code-content',
            cssProperty: 'input-value',
            cssValue: $('#code-content-input').val()
        },
        {
            elementClass: 'code-color',
            cssProperty: 'input-value',
            cssValue: $('#code-color').val()
        }
    ];
    setCodeProperties(properties, photoId)
}

function setCodeProperties(properties, photoId = null) {
    properties.forEach(property => {        
        if (photoId == null) { //set to all
            if (property.cssProperty == 'input-value') {
                $('.' + property.elementClass).val(property.cssValue)
            } else {
                $('.' + property.elementClass).css(property.cssProperty, property.cssValue);
            }
        } else {
            var element = $(`#${photoId} .code-container`)
                .find('.' + property.elementClass)
                .addBack('.' + property.elementClass)
            if (property.cssProperty == 'input-value') {
                element.val(property.cssValue);
            } else {
                element.css(property.cssProperty, property.cssValue);
            }
        }
    });
    printerIframe.setCodeProperties(properties, photoId)
}

var backuppedCodeProperties = []
function backupCodeProperties(photoId = null) {
    backuppedCodeProperties = [];
    var photoSelector = photoId ? `#${photoId}` : '.photo';
    $(photoSelector).each(function() {
        backuppedCodeProperties.push([
            {
                elementClass: 'code-container',
                cssProperty: 'display',
                cssValue: $(this).find('.code-container').css('display')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'border-radius',
                cssValue: $(this).find('.code-container').css('border-radius')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'background-color',
                cssValue: $(this).find('.code-container').css('background-color')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'height',
                cssValue: $(this).find('.code-container').css('height')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'width',
                cssValue: $(this).find('.code-container').css('width')
            },
            {
                elementClass: 'code-container',
                cssProperty: 'bottom',
                cssValue: $(this).find('.code-container').css('bottom')
            },
            {
                elementClass: 'code',
                cssProperty: 'background-image',
                cssValue: $(this).find('.code').css('background-image')
            },
            {
                elementClass: 'code-content',
                cssProperty: 'input-value',
                cssValue: $(this).find('.code-content').val()
            },
            {
                elementClass: 'code-color',
                cssProperty: 'input-value',
                cssValue: $(this).find('.code-color').val()
            }
        ]);
    })
    printerIframe.backupCodeProperties(photoId)
}

function restoreProperties(photoId = null) {
    var photoSelector = photoId ? `#${photoId}` : '.photo';
    $(photoSelector).each(function (index) {
        setCodeProperties(backuppedCodeProperties[index], `${$(this).attr('id')}`)
    })
    printerIframe.restoreProperties(photoId)
}

function setModalCodeState(idPhoto) {
    idPhoto = `#${idPhoto}`
    $(idPhoto).find('.code-container').css('display') != 'none' ? $('#code-enable-input').prop('checked', true) : $('#code-enable-input').prop('checked', false);
    $(idPhoto).find('.code-container').css('border-radius') != '0px' ? $('#code-shape-input').prop('checked', true) : $('#code-shape-input').prop('checked', false);
    $('#code-background-color').spectrum('set', $(idPhoto).find('.code-container').css('background-color'));
    $('#code-size-input').val(parseFloat($(idPhoto).find('.code-container').css('height')) * 2);
    $('#code-vertical-input').val(parseFloat($(idPhoto).find('.code-container').css('bottom')) * 2);
    $('#code-content-input').val($(idPhoto).find('.code-content').val());
    $('#code-color').spectrum('set', $(idPhoto).find('.code-color').val());
}

