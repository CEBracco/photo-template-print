var mailModal = null;
var filenameToAttach = null;
var mailModalOptions = {
    onOpenStart: function () {
    },
    onCloseEnd: function () {
        openSendToLabModal()
    },
    dismissible: false
}
$(document).ready(function () {
    var elem = document.querySelector('#mail-modal');
    mailModal = M.Modal.init(elem, mailModalOptions);

    $('#mail-modal input').on('keyup', function() {
        isValidMail() ? $('.send-mail-button').removeClass('disabled') : $('.send-mail-button').addClass('disabled');
    })
})

function openMailModal(fileToSend) {
    setMailData(fileToSend);
    mailModal.open();
}

function setMailData(fileToSend) {
    filenameToAttach = fileToSend;
    $.ajax({
        url: '/webformConfig',
        contentType: 'application/json',
        type: 'POST'
    }).done(function (res) {
        if (res.ok) {
            $('#email').val(res.data.emailTo);
            $('#email-subject').val(res.data.emailSubject);
            $('#email-body').val(res.data.emailBody);
            $('#email').trigger('keyup');
            M.updateTextFields();
            M.textareaAutoResize($('#email-body'));
        }
    })
}

function isValidMail() {
    var isValid = true
    $('#mail-modal input').each(function() {
        if (!this.checkValidity()) {
            isValid = false;
            return isValid;
        }
    })
    return isValid;
}

function sendMail() {
    $('#mail-modal a').addClass('disabled');
    $('#mail-modal input').attr("disabled", true);
    $('#mail-modal textarea').attr("disabled", true);
    $.ajax({
        url: '/sendMail',
        data: JSON.stringify({
            email: $('#email').val(),
            subject: $('#email-subject').val(),
            emailBody: $('#email-body').val(),
            filename: filenameToAttach
        }),
        contentType: 'application/json',
        type: 'POST'
    }).done(function (res) {
        if (res.ok) {
            M.toast({ html: 'El pedido ha sido enviado!' });
            $('#mail-modal a').removeClass('disabled');
            $('#mail-modal input').attr("disabled", false);
            $('#mail-modal textarea').attr("disabled", false);
            mailModal.close();
        } else {
            M.toast({ html: 'Ocurrió un error al enviar el pedido' });
        }
    })

}



