var textsProperties = []
var selectedText
var useCodeEditor = false
$(document).ready(function () {
    $('.photo .text').click(function (e) {
        e.stopPropagation();
        if (!selectedText && selectedPhoto) { discard() }
        selectedText = $(this).parent('.text-container')[0]
        if (selectedPhoto && ($(selectedPhoto).attr('id') != $(selectedText).closest('.photo')[0])) {
            restoreTextProperties()
        }
        selectedPhoto = $(selectedText).closest('.photo')[0]
        setTextColorInputs()
    }).jBox('Tooltip', {
        trigger: 'click',
        content: $('#text-mods-panel'),
        onOpen: function () {
            saveTextProperties();
            var jboxCalendarTooltip = this
            $('.jbox-close').one('click', function () {
                jboxCalendarTooltip.close()
            })
        },
        onClose: function () {
            selectedPhoto = null
            selectedText = null
        }
    });
    $('.apply-all-texts').change(toggleAllTextStyles)

    $('.btn-toggle-editor').click(function() {
        var textareaContainer = $(this).parents('.textfield-field');
        var textarea = textareaContainer.find('textarea')[0];
        if(textareaContainer.find('.CodeMirror').length > 0) {
            disableCodeEditor(textareaContainer)
            $(this).text('Usar editor de código');
            $('.code-tips').hide();
            useCodeEditor = false
        } else {
            enableCodeEditor(textarea)
            $(this).text('Usar editor de texto');
            $('.code-tips').show();
            useCodeEditor = true
        }
    })
})

function saveTextProperties() {
    textsProperties = []
    $('.photo .text-container').each(function () {
        var textProperties = {}
        textProperties["color|text"] = $(this).find('.text').css('color');
        textProperties["font-size|text"] = $(this).find('.text').css('font-size');
        textProperties["font-family|text"] = $(this).find('.text').css('font-family');
        textProperties["line-height|text"] = getLineHeightPercentage($(this).find('.text'));
        textProperties["text-align|text-container"] = $(this).css('text-align');
        textProperties["padding-top|text-container"] = $(this).css('padding-top');
        textProperties["html-content|text"] = $(this).find('.text').html();
        textProperties["background-color|text"] = $(this).find('.text').css('background-color');
        textProperties["padding|text"] = $(this).find('.text').css('padding');
        textProperties["border-radius|text"] = $(this).find('.text').css('border-radius');

        textsProperties.push(textProperties);
    })
}

function restoreTextProperties() {
    if (textsProperties) {
        $('.photo .text-container').each(function (index) {
            var textProperties = textsProperties[index];
            for (const property in textProperties) {
                if (textProperties.hasOwnProperty(property)) {
                    const style = textProperties[property];
                    const cssProperty = property.split('|')[0];
                    const propertyElement = property.split('|')[1];
                    if(cssProperty == 'html-content'){
                        var textToSet = useCodeEditor ? style : style.replace(/\r?\n/g, '<br>');
                        $(this).find('.' + propertyElement).addBack('.' + propertyElement).html(textToSet);
                    } else {
                        $(this).find('.' + propertyElement).addBack('.' + propertyElement).css(cssProperty, style);
                    }
                }
            }
        })
        printerIframe.restoreTextProperties(textsProperties)
    }
}

function textPreviewChanges(elementClass, cssProperty, cssValue) {
    realCssValue = getRealCssValue(cssProperty,cssValue)
    if ($('.apply-all-texts').is(':checked')) {
        if(cssProperty == 'html-content'){
            var htmlContent = useCodeEditor ? realCssValue : realCssValue.replace(/\r?\n/g, '<br>')
            $('.' + elementClass).html(htmlContent);
        } else{
            $('.' + elementClass).css(cssProperty, realCssValue);
        }
    } else {
        if (cssProperty == 'html-content') {
            var htmlContent = useCodeEditor ? realCssValue : realCssValue.replace(/\r?\n/g, '<br>')
            $(selectedText).find('.' + elementClass).addBack('.' + elementClass).html(htmlContent);
        } else {
            $(selectedText).find('.' + elementClass).addBack('.' + elementClass).css(cssProperty, realCssValue);
        }
    }
    printerIframe.setTextProperties($(selectedPhoto).attr('id'), {
        elementClass: elementClass,
        cssProperty: cssProperty,
        cssValue: getRealCssValue(cssProperty, cssValue, 10)
    }, $('.apply-all-texts').is(':checked'));
}

function toggleAllTextStyles() {
    restoreTextProperties()
    $('#text-mods-panel .textfield-field textarea, #text-mods-panel .number-field input, #text-mods-panel .select-field select, #text-mods-panel .color-field input').trigger('change')
}

function setTextColorInputs() {
    $('#text-mods-panel .color-field input').each(function () {
        var cssProperty = $(this).data('cssElementProperty').split('|')[0];
        var elementClass = $(this).data('cssElementProperty').split('|')[1];
        $(this).spectrum("set", $(selectedText).find('.' + elementClass).addBack('.' + elementClass).first().css(cssProperty));
    })
    $('#text-mods-panel .number-field input').each(function () {
        var cssProperty = $(this).data('cssElementProperty').split('|')[0];
        var elementClass = $(this).data('cssElementProperty').split('|')[1];
        $(this).val(parseInt($(selectedText).find('.' + elementClass).addBack('.' + elementClass).first().css(cssProperty)));
        if(cssProperty == 'line-height') {
            $(this).val(getLineHeightPercentage($(selectedText).find('.' + elementClass).addBack('.' + elementClass).first())*10);
        }
    })
    $('#text-mods-panel .select-field select').each(function () {
        var cssProperty = $(this).data('cssElementProperty').split('|')[0];
        var elementClass = $(this).data('cssElementProperty').split('|')[1];
        $(this).val($(selectedText).find('.' + elementClass).addBack('.' + elementClass).first().css(cssProperty));
        $('select').formSelect();
    })
    $('#text-mods-panel .textfield-field > textarea').each(function () {
        var cssProperty = $(this).data('cssElementProperty').split('|')[0];
        var elementClass = $(this).data('cssElementProperty').split('|')[1];
        if (cssProperty == 'html-content') {
            $(this).val($(selectedText).find('.' + elementClass).addBack('.' + elementClass).first().html().replace(/<br>/g, '\n'));
        }
        M.textareaAutoResize($(this));
    })
    $('#text-mods-panel .textfield-field > .CodeMirror').each(function () {
        var textareaContainer = $(this).parents('.textfield-field');
        var textarea = textareaContainer.find('textarea')[0];
        var cssProperty = $(textarea).data('cssElementProperty').split('|')[0];
        var elementClass = $(textarea).data('cssElementProperty').split('|')[1];
        
        this.CodeMirror.setValue($(selectedText).find('.' + elementClass).addBack('.' + elementClass).first().html());
        var that = this
        setTimeout(function () {
            that.CodeMirror.refresh();
        }, 1);
    })
}

function getRealCssValue(cssProperty, cssValue, scale = 1) {
    switch (cssProperty) {
        case 'font-size':
            return `calc(${cssValue}px * ${scale})`;
        case 'padding-top':
            return `calc(${cssValue}px * ${scale})`;
        case 'line-height':
            return cssValue / 10;
        case 'padding':
            return `calc(${cssValue}px * ${scale})`;
        case 'border-radius':
            return `calc(${cssValue}px * ${scale})`;
        default:
            return cssValue
    }
}

function getLineHeightPercentage(elem){
    var fontSize=parseFloat(elem.css('font-size'));
    var lineHeightPx = parseFloat(elem.css('line-height'));
    return ((lineHeightPx*100) / fontSize) / 100;
}

function disableCodeEditor(textareaContainer) {
    var textarea = textareaContainer.find('textarea')[0];
    textareaContainer.find('.CodeMirror')[0].CodeMirror.toTextArea();
    $(textarea).val($(textarea).val().replace(/\n<br>\n|<br>/g, '\n'));
    M.textareaAutoResize($(textarea));
}

function enableCodeEditor(textarea) {
    var codeMirrorTextArea = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        theme: 'material-darker',
        mode: "htmlmixed",
    });
    codeMirrorTextArea.on('keyup', function () {
        codeMirrorTextArea.save()
        M.textareaAutoResize($(textarea));
        $(textarea).trigger('change')
    })
    codeMirrorTextArea.doc.setValue(codeMirrorTextArea.doc.getValue().replace(/\r?\n/g, '\n<br>\n'));
}