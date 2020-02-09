$(document).ready(function() {
    $('.collapsible').collapsible({
        accordion: false
    });
    $('.status-dropdown li').click(function(){
        changeOrderStatus(this)
    })
    $('.btn-filter').click(function() {
        listOrders();
    })
    init()
})

function appendOrder(order) {
    var rendered = Mustache.render(orderTemplate, { order: enhancedOrder(order) });
    $('#orders-table > tbody:last-child').append(rendered)
}

function enhancedOrder(order) {
    order.price = order.Product.price + order.Background.price + order.Text.Typography.price;
    order.translatedDeliveryMethod = getTranslatedDeliveryMethod(order);
    order.translatedPaymentMethod = order.paymentMethod == 'mercadopago' ? 'MercadoPago' : 'Efectivo';
    order.formattedCreatedAt = new Date(order.createdAt).formatDateTime()
    order.translatedStatus = translateStatus(order.status)
    order.clientName = getClientName(order)
    return order
}

function getClientName(order) {
    return `${order.name} ${order.surname}${(order.instagramUser && order.instagramUser != '') ? ' ('+ order.instagramUser + ')' : ''}`;
}

function getTranslatedDeliveryMethod(order) {
    var deliveryMethod = order.deliveryMethod == 'shipping' ? 'Envío' : 'Punto de Entrega'
    if(order.deliveryMethod == 'deliveryPoint' && order.deliveryPoint && order.deliveryPoint != '') {
        return `${deliveryMethod} (${order.deliveryPoint})`
    } else {
        return deliveryMethod
    }
}

function translateStatus(key) {
    switch (key) {
        case 'pending':
            return 'Pendiente'
        case 'design':
            return 'Diseño'
        case 'print':
            return 'Impresion'
        case 'packaging':
            return 'Corte y Empaquetado'
        case 'ready':
            return 'Listo para la entrega'
        case 'delivered':
            return 'Entregado'
        default:
            return ''
    }
}

function changeOrderStatus(selectedStatus) {
    var statusButton = $(selectedStatus).parents('.status-container').find('.dropdown-trigger');
    var actualStatus = statusButton.data('status');
    var newStatus = $(selectedStatus).data('status');
    var orderId = $(selectedStatus).closest('.status-dropdown').attr('id').split('-')[1];
    OrderService.setStatus({ orderId: orderId, status: newStatus }, function () {
        statusButton.data('status', newStatus);
        statusButton.text(translateStatus(newStatus));
        statusButton.removeClass(actualStatus + "-status");
        statusButton.addClass(newStatus + "-status");
    })
}

function openStatusDropdown(statusButton){
    var dropdownElem = $(statusButton).parents('.status-container').find('.dropdown-trigger')[0];
    var instance = M.Dropdown.getInstance(dropdownElem);
    if(!instance){
        instance=M.Dropdown.init(dropdownElem)
    }
    instance.open()
}

function listOrders(filter = constructFilter()) {
    $('#orders-table > tbody').empty();
    $('.loading-orders-spinner').removeClass('hide');
    OrderService.list({ filter: filter }, function (res) {
        $('.loading-orders-spinner').addClass('hide');
        if (res.ok) {
            var orders = res.data;
            orders.forEach(function (order) {
                appendOrder(order)
            });
        }
    })
}

function constructFilter() {
    var filter = {
        statuses: []
    }
    $('.status-filter:checked').each(function () {
        filter.statuses.push($(this).data('status'))
    })
    return filter
}

var orderTemplate
var cellphoneOrderTemplate
function loadOrderTemplates() {
    orderTemplate = $('#order-template tbody').html();
    Mustache.parse(orderTemplate);
}

function init() {
    loadOrderTemplates();
}