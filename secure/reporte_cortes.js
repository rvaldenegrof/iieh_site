function reporte_cortes_fnc($rootScope, $scope, $routeParams, $http,$filter) {
    $rootScope.link_vermsg = "";
    $rootScope.link_addmsg = "";
    $rootScope.link_verat = "";
    $rootScope.link_agrmsg = "";
    $rootScope.link_repcorte = "active";
    $rootScope.link_valinci = "";
     $scope.data1 = [];
	$scope.data2 = [];
	$scope.data3 = [];	    
    $scope.selectedEmpresa ={};
    $scope.empresas = [
                            {name:'TODAS', id:1},
                            {name:'ENEL Dx', id:10},
                            {name:'Colina', id:12},
                            {name:'Luz Andes', id:15}
    ];
                        
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
            return Date.UTC(aInfoDia.ANHO, aInfoDia.MES - 1, aInfoDia.DIA, aInfoDia.HORA,aInfoDia.MINU );
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
    }
    
    Highcharts.setOptions({
        lang: {
            months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"],
            shortMonths: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            weekdays: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
        }
    }
            );
    $scope.handleClick = function($event) {
        $event.preventDefault(); // <- obviously you'd remove this
        $event.stopPropagation(); // <- and this
        if($event.toElement.innerHTML === "All"){
            MuestraResumenClientesAll();
        }
        
      };
  
    function createStockChart() {
        
        endDate = new Date();
        startDate = new Date(endDate);
        
        startDate.setDate(startDate.getDate() - 1);
        
        $("#chart-stock-content").highcharts("StockChart", {
            
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
                enabled : true
            },
            
            credits: {
                enabled: false
            },
            legend: {
                enabled: true,
                align: 'left'
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
                align: 'left',
                verticalAlign: 'top',
                y: 20,
                floating: true,
                borderWidth: 0
            },
            
            colors: ["#5677FC", "#21B11C", "#EA1E63"],
            title: {
                text: "Clientes sin suministro",
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
                                for (var i = 0; i < this.series.data.length; i++) {
                                    if(typeof this.series.data[i] != 'undefined' )
                                        this.series.data[i].update({color: '#5677FC'}, true, false);
                                };
                                this.update({ color: '#ffb31a' }, true, false);
                            }
                        }
                    }
                }
            },
            
            series: [
                {
                    name: "Clientes sin suministro",
                    type: 'column',
                    data: ClientesSinSuministo.AsDataToChart(),
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
        
         var payload = {"anho": dia.ANHO, "mes" :  dia.MES, "dia": dia.DIA, "hora" :  dia.HORA, "minuto" : dia.MINU
            };
            
//        $('iframe').attr('src', 'ListaClientesRegion.aspx?' + params);
        $http.post("../rest/iieh/detalle_reporte", payload).then(function(response) {
            $scope.detalleReporte = response.data;
        });
    }
    
    function MuestraResumenClientesAll()
    {
        $http.get("../rest/iieh/clientes_reporte_all").then(function(response) {
            $scope.detalleReporte = response.data;
        });
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
                //return resultResponse.d;
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
    
    $scope.cargaFechaActual = function(){
        $http.get("../rest/iieh/date").then(function(response) {
            var fechaActual = response.data[0]["CURDATE"].trim() ;
            $scope.fechainterrupcionInicio = fechaActual;
            var spltfechaActual = fechaActual.split(" ");
            var finDia = "23:59:59 " + spltfechaActual[1];
            $scope.fechainterrupcionFin = finDia;
        });
    };
    
    $scope.exportarExcel = function(){
        //        $("#expTabla").table2excel({
        //                    // exclude CSS class
        //                    exclude: ".noExl",
        //                    name: "Excel Document Name",
        //                    filename: "ReporteIncidencias"
        //                }); 
        
        
        var empresa = $scope.selectedEmpresa.id;                         
        payload = {"fechaInicio": $scope.fechainterrupcionInicio,
            "fechaHasta" : $scope.fechainterrupcionFin, 
            "empresa" : empresa};
        
        $http.post("../rest/iieh/detalle_reporte_filtros", payload).then(function(response) {
            $scope.data = response.data;
            if($scope.data.length > 0){ $scope.data1 = [];
	$scope.data2 = [];
	$scope.data3 = [];    for (var i = 0; i < $scope.data.length; i++){
                        if (($scope.data[i].EMPRESA.toUpperCase() === 'ENEL DX' && empresa === 1) || ($scope.data[i].EMPRESA.toUpperCase() === 'ENEL DX' && empresa === 10))
						{
							$scope.data1.push($scope.data[i]);							
						}
						if (($scope.data[i].EMPRESA.toUpperCase() === 'LUZ ANDES' && empresa === 1) || ($scope.data[i].EMPRESA.toUpperCase() === 'LUZ ANDES' && empresa === 15))
						{
							$scope.data2.push($scope.data[i]);							
						}
						if (($scope.data[i].EMPRESA.toUpperCase() === 'COLINA' && empresa === 1) || ($scope.data[i].EMPRESA.toUpperCase() === 'COLINA' && empresa === 12))
						{
							$scope.data3.push($scope.data[i]);						
						}                        
                }   var opts = [];
                var dt = [];
                
                if($scope.data3.length > 0){
                    opts.unshift({sheetid:'COLINA',header:true});
                    var k = JSON.parse(JSON.stringify( $scope.data3, ["FECHA","HORA","MINU","COMUNA","EMPRESA","CLIENTES", "CUADRILLAS"] , 4));
                    dt.unshift(k);
                }
                if($scope.data2.length > 0){
                    opts.unshift({sheetid:'LUZ ANDES',header:true});
                    var k = JSON.parse(JSON.stringify( $scope.data2, ["FECHA","HORA","MINU","COMUNA","EMPRESA","CLIENTES", "CUADRILLAS"] , 4));
                    dt.unshift(k);
                }
                if($scope.data1.length > 0){
                    opts.unshift({sheetid:'ENEL DX',header:true});
                    var k = JSON.parse(JSON.stringify( $scope.data1, ["FECHA","HORA","MINU","COMUNA","EMPRESA","CLIENTES", "CUADRILLAS"] , 4));
                    dt.unshift(k);
                }    
                
                var res = alasql('SELECT INTO XLSX("ReporteIncidencias.xlsx",?) FROM ?',[opts,dt]); 
            }
            
        });
        
    };
    
    $scope.exportarCSV = function(){
        //$("#expTabla").tableToCSV();
        var empresa = $scope.selectedEmpresa.id;                         
        payload = {"fechaInicio": $scope.fechainterrupcionInicio,
            "fechaHasta" : $scope.fechainterrupcionFin, 
            "empresa" : empresa};
        
        $http.post("../rest/iieh/detalle_reporte_filtros", payload).then(function(response) {
            $scope.data = response.data;
            if($scope.data.length > 0){
                

               
                var datos = $scope.data;
                // Convert Object to JSON
                var jsonObject = JSON.stringify(datos);
                var array = typeof jsonObject != 'object' ? JSON.parse(jsonObject) : jsonObject;
                var str = 'data:text/csv;charset=utf-8,';
                
                for (var i = 0; i < array.length; i++) {
                    var line = '';
                    for (var index in array[i]) {
                        if (line != '') line += ','
                        
                        line += array[i][index];
                    }
                    
                    str += line + '\r\n';
                }
                
                
                
                var encodedUri = encodeURI(str);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "ReporteIncidencias.csv");
                document.body.appendChild(link); // Required for FF

                link.click();
              
            }
            
        });
    };
    
    $scope.cargaFechaActual();
    
}