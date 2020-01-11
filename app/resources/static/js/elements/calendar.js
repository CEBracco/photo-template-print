var calendarsProperties = []
var selectedCalendar
$(document).ready(function () {
    $('.polly-calendar').click(function (e) {
        e.stopPropagation();
        if (!selectedCalendar && selectedPhoto) { discard() }
        selectedCalendar = this
        if (selectedPhoto && ($(selectedPhoto).attr('id') != $(selectedCalendar).closest('.photo')[0])) {
            restoreCalendarsProperties()
        }
        selectedPhoto = $(selectedCalendar).closest('.photo')[0]
        setColorInputs()
    }).jBox('Tooltip', {
        trigger: 'click',
        content: $('#calendar-mods-panel'),
        onOpen: function () {
            saveCalendarsProperties();
            var jboxCalendarTooltip = this
            $('.jbox-close').one('click', function () {
                jboxCalendarTooltip.close()
            })
        },
        onClose: function () {
            selectedPhoto = null
            selectedCalendar = null
        }
    });
    $('.apply-all-calendars').change(toggleAllStyles)
})

function saveCalendarsProperties() {
    calendarsProperties = []
    $('.polly-calendar').each(function () {
        var calendarProperties = {}
        calendarProperties["background-color|polly-calendar"] = $(this).css('background-color');
        calendarProperties["color|calendar-day"] = $(this).find('.calendar-day').css('color');
        calendarProperties["color|calendar-date"] = $(this).find('.calendar-date').css('color');
        calendarProperties["color|calendar-monthAndYear"] = $(this).find('.calendar-monthAndYear').css('color');
        calendarProperties["background-color|calendar-separator"] = $(this).find('.calendar-separator').css('background-color');

        calendarsProperties.push(calendarProperties);
    })
}

function restoreCalendarsProperties() {
    if (calendarsProperties) {
        $('.polly-calendar').each(function (index) {
            var calendarProperties = calendarsProperties[index];
            for (const property in calendarProperties) {
                if (calendarProperties.hasOwnProperty(property)) {
                    const style = calendarProperties[property];
                    const cssProperty = property.split('|')[0];
                    const propertyElement = property.split('|')[1];
                    $(this).find('.' + propertyElement).addBack('.' + propertyElement).css(cssProperty, style);
                }
            }
        })
        printerIframe.restoreCalendarsProperties(calendarsProperties)
    }
}

function calendarPreviewChanges(elementClass, cssProperty, cssValue) {
    if ($('.apply-all-calendars').is(':checked')) {
        $('.' + elementClass).css(cssProperty, cssValue);
    } else {
        $(selectedCalendar).find('.' + elementClass).addBack('.' + elementClass).css(cssProperty, cssValue);
    }
    printerIframe.setCalendarProperties($(selectedPhoto).attr('id'), {
        elementClass: elementClass,
        cssProperty: cssProperty,
        cssValue: cssValue
    }, $('.apply-all-calendars').is(':checked'));
}

function toggleAllStyles() {
    restoreCalendarsProperties()
    $('#calendar-mods-panel .color-field input').trigger('change')
}

function setColorInputs() {
    $('#calendar-mods-panel .color-field input').each(function () {
        var cssProperty = $(this).data('cssElementProperty').split('|')[0];
        var elementClass = $(this).data('cssElementProperty').split('|')[1];
        $(this).spectrum("set", $(selectedCalendar).find('.' + elementClass).addBack('.' + elementClass).first().css(cssProperty));
    })
}