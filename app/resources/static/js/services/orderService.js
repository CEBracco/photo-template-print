var OrderService = {
    setStatus: function (data, success) {
        data.authToken = webformConfig.token;
        $.ajax({
            url: `${webformConfig.url}/order/setStatus`,
            contentType: 'application/json',
            data: JSON.stringify(data),
            type: 'POST'
        }).done(success);
    },
    list: function (data, success) {
        data.authToken = webformConfig.token;
        $.ajax({
            url: `${webformConfig.url}/order/list`,
            contentType: 'application/json',
            data: JSON.stringify(data),
            type: 'POST'
        }).done(success);
    },
    download: function (data, success) {
        $.ajax({
            url: `/downloadOrder`,
            contentType: 'application/json',
            data: JSON.stringify(data),
            type: 'POST'
        }).done(success);
    }
}