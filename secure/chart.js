var ClientesSinSuministo = {
    infoDia: [],
    addInfoDia : function(aInfoDia)
    {
        this.infoDia.push(aInfoDia);
    },
    getInfoDia: function (index)
    {
        return this.infoDia[index];
    },
    getInfoDiaAsUTCDate: function(index)
    {
        aInfoDia = this.infoDia[index];
        return Date.UTC(aInfoDia.ANHO, aInfoDia.MES - 1, aInfoDia.DIA, aInfoDia.HORA);
    },
    AsDataToChart ()
    {
        result = [];
        countData = this.infoDia.length;
        for (var i = 0; i < countData; i++) {
            dateUTC = this.getInfoDiaAsUTCDate(i);
            result.push([dateUTC, this.infoDia[i].CLIENTES_AFECTADOS]);
        }
        return result;
    }
};
    
Highcharts.setOptions({
    lang: {
        months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"],
        shortMonths: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        weekdays: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
        }
    }
);


function createStockChart() {

    endDate = new Date();
    startDate = new Date(endDate);

    startDate.setDate(startDate.getDate());

    $("#chart-stock-content").highcharts("StockChart", {
        //rangeSelector: {
        //    inputEnabled: false,
        //    enabled: false
        //},

        rangeSelector: {
            buttons: [
            {
                type: 'day',
                count: 1,
                text: '1D'
            }, {
                type: 'all',
                count: 1,
                text: 'All'
            }],
            selected: 0,
            inputEnabled: false
        },

        tooltip: {
            enabled : false
        },

        credits: {
            enabled: false
        },

        yAxis: {
            title: {
                text: "Clientes sin suministro"
            },
            labels: {
                style: {
                    "color": "#333333", "fontSize": "12px"
                }
            },
            min:0
        },
        xAxis: {
            min: startDate.getTime(),
            max: endDate.getTime(),
            labels: {
                style: {
                    "color": "#c31d21", "fontSize": "12px"
                }
            }
        },

        legend: {
            enabled: true,
            align: 'left',
            verticalAlign: 'top',
            y: 20,
            floating: true,
            borderWidth: 0
        },

        colors: ["#5677FC", "#21B11C", "#EA1E63"],
        title: {
            text: "Clientes sin sumimistro",
            align: "left",
            style: { "color": "#333333", "fontSize": "12px" }
        },

        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            //dt = new Date(this.category);
                            MuestraResumenClientes(
                                    ClientesSinSuministo.getInfoDia(this.index)
                                );
                            //DetalleInfo(ClientesSinSuministo.getInfoDia(this.index));
                        }
                    }
                }
            }
        },

        series: [
            {
                name: "Clientes sin suministro",
                type: 'column',
                data: ClientesSinSuministo.AsDataToChart()
            }
        ]
        
    });
}

function DetalleInfo(day) {
    alert("" + day.DIA + " " + day.MES + " " + day.ANHO + " " + day.HORA);
}

function MuestraResumenClientes(dia)
{
    params = 'anho=' + dia.ANHO + '&mes=' + dia.MES + '&dia=' + dia.DIA+ '&hora=' + dia.HORA;
    $('iframe').attr('src', 'ListaClientesRegion.aspx?' + params);
}



function requestData() {
    var resultResponse;
    
    return $.ajax({
        url: "../rest/iieh/clientes_reporte",
        dataType: "json",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            resultResponse = response;
        },
        complete: function () {
            return resultResponse.d;
        },
        error: OnError
    });

}

function OnError(xmlHttpRequest, textStatus) {
    alert(xmlHttpRequest.responseText);
};

function formatDataToStock(data) {
    countData = data.length;
    for (var i = 0; i < countData; i++) {
        ClientesSinSuministo.addInfoDia(data[i]);
    }

    createStockChart();
}

$.when(requestData())
    .done(function (dataReclamos) {
        formatDataToStock(dataReclamos);
});