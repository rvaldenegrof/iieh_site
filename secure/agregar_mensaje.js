function agregar_mensaje_fnc($rootScope, $scope, $routeParams, $http) {
    $rootScope.link_vermsg = "";
    $rootScope.link_addmsg = "";
    $rootScope.link_verat = "";
    $rootScope.link_agrmsg = "active";

    $scope.size = 10;
    $scope.totAlim = 0.0;
    $scope.totalAlimentadores = 0;
    $scope.fechaTerminoInterrupcion = {};
    $scope.fechaInterrupcion = {};
    $scope.tiempoInterrupcion = {};
    $scope.totalAlimentadoresTotal = 0;
    $scope.codigoProceso = 1;
	
    $scope.clientesAfectados = {};
    $scope.clientesIniciales = {};
    $scope.tiempoInterrupcion = {};
    $scope.cuadrillasPesadas = {};
    $scope.cuadrillasLivianas = {};
    $scope.tiempoReposicion = {};
    $scope.numeroInterrupcion = {};
	
    $http.get("../rest/iieh/empresas").then(function(response) {
        var empresas = response.data;
		
        for (var i = 0; i < empresas.length; i++) {
            if (empresas[i].IEMP_CODIGOSEC === 15) {
            	empresas[i].IEMP_NOMBRE = "LUZ ANDES";
                break;
            }
        }
		
        $scope.empresas = empresas;
    });
	
    $scope.setIniciales = function(index, valor){
        $scope.clientesIniciales[index] = valor; //just to show that it is calculated field
        return $scope.clientesIniciales[index];
    };
	
    $scope.validaciones = function(){

        var valido = true;

        if($scope.totalAlimentadores !== 0){

            if($scope.selectedItem != null){

                if($scope.selectedItem.IEMP_CODIGOSEC == 15 || $scope.selectedItem.IEMP_CODIGOSEC == 12){
                    for (var i = 0; i < $scope.records.length; i++) {
                        if($scope.records[i].selected == true){
                            if(!isNaN(parseFloat($scope.clientesAfectados[i + 1])) && isFinite($scope.clientesAfectados[i + 1])){
								
                                if(!isNaN(parseFloat($scope.clientesIniciales[i + 1])) && isFinite($scope.clientesIniciales[i + 1])){
										
										
                                    if($scope.validaFecha($scope.fechaInterrupcion[i + 1])){
											
                                        if($scope.validaFecha($scope.fechaTerminoInterrupcion[i + 1])){
												
												
                                            if(!isNaN(parseFloat($scope.cuadrillasPesadas[i + 1])) && isFinite($scope.cuadrillasPesadas[i + 1])){
                                                if(!isNaN(parseFloat($scope.cuadrillasLivianas[i + 1])) && isFinite($scope.cuadrillasLivianas[i + 1])){
                                                    if(!isNaN(parseFloat($scope.numeroInterrupcion[i])) && isFinite($scope.numeroInterrupcion[i])){
                                                        //valido = true;
                                                    }else{
                                                        valido = false;
                                                    }
                                                }else{
                                                    valido = false;
                                                }
                                            }else{
                                                valido = false;
                                            }
                                        }else{
                                            valido = false;
                                        }
                                    }else{
                                        valido = false;
                                    }
                                }else{
                                    valido = false;
                                }
                            }else{
                                valido = false;
                            }
                        }
                    }	
                }else{
                    valido = false;
                }
            }else{
                valido = false;
            }
					
        }else{
            valido = false;
        }

        if(valido){
			
            $scope.labelResultadoTexto = " ";
            $scope.labelResultadoClase = "";
            $scope.labelResultadoEstilo = "";
            $scope.agregarMensaje();
        }else{

            $scope.labelResultadoTexto = "  DEBE INGRESAR TODOS LOS DATOS CORRECTAMENTE.  ";
            $scope.labelResultadoClase = "glyphicon glyphicon-warning-sign";
            $scope.labelResultadoEstilo = "myStyle={'color:red'}";
        }
		
        return valido;
    };
	
	
	
	
    $scope.validaNumero = function(value){
        if (/^([0-9])*$/.test(value)){
            return true;
        }
        else{
            return false;
        }
		
    };
	
	
    $scope.validarFecha = function(value) {
		
        var esValida = $scope.validaFecha(value);
        if(tipo == 1){
            if(esValida){
                $scope.validarFecha
            }else{
				
            }
        }else{
            if(esValida){
				
            }else{
				
            }
        }

    };
	
	
    $scope.validaFecha = function(value) {
        // capture all the parts
        if(value == "1900-01-01")
            return true;
        if(value === undefined)
            return false;
		
        var matches = value.match(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
        if (matches === null) {
            return false;
        } else{
            // now lets check the date sanity
            var year = parseInt(matches[1], 10);
            var month = parseInt(matches[2], 10) - 1; // months are 0-11
            var day = parseInt(matches[3], 10);
            var hour = parseInt(matches[4], 10);
            var minute = parseInt(matches[5], 10);
            var second = parseInt(matches[6], 10);
            var date = new Date(year, month, day, hour, minute, second);
            if (date.getFullYear() !== year
                    || date.getMonth() != month
                    || date.getDate() !== day
                    || date.getHours() !== hour
                    || date.getMinutes() !== minute
                    || date.getSeconds() !== second
                    ) {
                return false;
            } else {
                return true;
            }
	    
        }
    };

    $scope.cambiarEmpresa = function() {
        $scope.fechaTerminoInterrupcion = {};
        $scope.fechaInterrupcion = {};
        $scope.tiempoInterrupcion = {};
        $scope.totalAlimentadoresTotal = 0;
        $scope.codigoProceso = 1;
		
        $scope.clientesAfectados = {};
        $scope.clientesIniciales = {};
        $scope.tiempoInterrupcion = {};
        $scope.cuadrillasPesadas = {};
        $scope.cuadrillasLivianas = {};
        $scope.tiempoReposicion = {};
        $scope.numeroInterrupcion = {};
		
        if($scope.selectedItem == null){
            $scope.records= {};
            $scope.totalAlimentadores = 0;
            return;
        }
			
        $http.get("../rest/iieh/listar_alimentadores_mensajes?id=" + $scope.selectedItem.IEMP_CODIGOSEC).then(function(response) {
            $scope.records = response.data;
			
            var payload = {"fechaMensaje": $scope.hora.glosa,
                "codSec" :  $scope.selectedItem.IEMP_CODIGOSEC};
            var cantidadHoy = 0;		
            $http.post('../rest/iieh/seq_numero_interrupcion', payload).then(function(response) {
	    		
                cantidadHoy =  response.data[0]["cantidadHoy"];
                //$scope.numeroInterrupcion = response.data;
	    		
                var length = $scope.records.length;
                $scope.totalAlimentadoresTotal = length;
                $scope.totalAlimentadores = length;
                for (var i = 0; i < length; i++) {
                    $scope.records[i].selected = true;
                    var parts = $scope.hora.glosa.split(" ");
                    var part1 = parts[0]; // YYYY/MM/DD
                    var parts2 = part1.split("/");
                    var yy = parts2[0].substring(2, 4);
                    var mm = parts2[1];
                    var dd = parts2[2];
                    var s = "000" + (cantidadHoy + i + 1 );
                    var numeroCompuesto = s.substr(s.length-3);
                    var strSecuenciaCompuesta = "" + $scope.selectedItem.IEMP_CODIGOSEC + yy + mm+dd + numeroCompuesto;
                    $scope.numeroInterrupcion[i] = strSecuenciaCompuesta;
                }
				
                $scope.arrComunas = [];
                for (var i = 0; i < response.data.length; i++) {
                    $scope.arrComunas.push({
                        "nom" : response.data[i]["ALIMENTADOR"],
                        "sel" : (response.data[i]["EVAL"] == 1)
                    });
                }
                $scope.numCoumnas = 0;
                for (var i = 0; i < $scope.totComunas; i++) {
                    if ($scope.arrComunas[i]["sel"])
                        $scope.numCoumnas++;
                }
				
				
                $scope.selSTART();
            });
			
			
			
        });
    };
    
    $scope.agregarMensaje = function() {

    	
    	var payload = {"fechaMensaje": $scope.hora.glosa,
            "cantRegistros" : $scope.totalAlimentadores, 
            "iempId" : $scope.selectedItem.IEMP_ID, 
            "codSec" : $scope.selectedItem.IEMP_CODIGOSEC, 
            "codProceso" : $scope.codigoProceso, 
            "usuModifica" : $scope.username,
    					
            "data" : $scope.records,
            "clientesIniciales" : $scope.clientesIniciales,
            "clientesAfectados" : $scope.clientesAfectados,
            "tiempoInterrupcion" : $scope.tiempoInterrupcion,
            "fechaTerminoInterrupcion" : $scope.fechaTerminoInterrupcion,
            "fechaInterrupcion" : $scope.fechaInterrupcion,
            "cuadrillasPesadas" : $scope.cuadrillasPesadas,
            "cuadrillasLivianas" : $scope.cuadrillasLivianas,
            "tiempoReposicion" : $scope.tiempoReposicion,
            "numeroInterrupcion" : $scope.numeroInterrupcion
        };
		
    	$http.put('../rest/iieh/mensaje_crear', payload).then(function(response) {

            if(response.data[0]["resultado"] === 0){
                alert('Error: No se pudo guardar adecuadamente el mensaje.');
            }else{
                alert('Exito: Mensaje guardado exitosamente.');
            }
    	},function(reject){
            alert('Error: No se pudo guardar adecuadamente el mensaje.');
      	});
    };
    
    
    $scope.terminoChange = function(item) {
    	var f1 = $scope.fechaTerminoInterrupcion[item];
    	var f2 = $scope.fechaInterrupcion[item];


    	var ff1 = f1.split(" ");
    	var fecha1 = ff1[0];
    	var fechaPartes = fecha1.split("-");
    	var tiempo1 = ff1[1];
    	var tt1 = tiempo1.split(":");
    	var ft1 = new Date(fechaPartes[0], fechaPartes[1] - 1, fechaPartes[2], tt1[0], tt1[1], tt1[2] );
    	
    	var ff2 = f2.split(" ");
    	var fecha2 = ff2[0];
    	var fechaPartes2 = fecha2.split("-");
    	var tiempo2 = ff2[1];
    	var tt2 = tiempo2.split(":");
    	var ft2 = new Date(fechaPartes2[0], fechaPartes2[1] - 1, fechaPartes2[2], tt2[0], tt2[1], tt2[2] );
    	

    	var valorFinal = ((ft1 - ft2) / 1000 / 60 / 60).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    	if(valorFinal < 0.009){
            valorFinal = 0;
    	}
    	$scope.tiempoInterrupcion[item] = valorFinal;
    };
    
    $scope.inicioChange = function(item) {
    	var f1 = $scope.fechaTerminoInterrupcion[item];
    	var f2 = $scope.fechaInterrupcion[item];
    	var ff1;
    	var fecha1;
    	var fechaPartes1;
    	var tiempo1;
    	var tt1;
    	var ft1;

    	if(f1 === undefined || f1 == "1900-01-01 00:00:00"){
    		
            var fMsg = $scope.hora.glosa;
            fMsg = fMsg.replace(/\//g, '-');
            ff1 = fMsg.split(" ");
            fecha1 = ff1[0];
            fechaPartes1 = fecha1.split("-");
            tiempo1 = ff1[1];
            tt1 = tiempo1.split(":");
            ft1 = new Date(fechaPartes1[0], fechaPartes1[1] - 1, fechaPartes1[2], tt1[0], tt1[1], tt1[2] );
    	}
    	else{
            ff1 = f1.split(" ");
            fecha1 = ff1[0];
            fechaPartes1 = fecha1.split("-");
            tiempo1 = ff1[1];
            tt1 = tiempo1.split(":");
            ft1 = new Date(fechaPartes1[0], fechaPartes1[1] - 1, fechaPartes1[2], tt1[0], tt1[1], tt1[2] );
    	}
    		

    	var ff2 = f2.split(" ");
    	var fecha2 = ff2[0];
    	var fechaPartes2 = fecha2.split("-");
    	var tiempo2 = ff2[1];
    	var tt2 = tiempo2.split(":");
    	var ft2 = new Date(fechaPartes2[0], fechaPartes2[1] - 1, fechaPartes2[2], tt2[0], tt2[1], tt2[2] );


    	var valorFinal = ((ft1 - ft2) / 1000 / 60 / 60).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    	if(valorFinal < 0.009 ){
            valorFinal = 0;
    	}
    	$scope.tiempoInterrupcion[item] = valorFinal;
    };
    
    $scope.cambiarMensaje = function() {
    	

    	for (var item = 0; item < $scope.records.length; item++) {
            if($scope.records[item].selected == true){
                var fechaInterrupcionValida = $scope.validaFecha($scope.fechaInterrupcion[item + 1]);
                var fechaTerminoValida = $scope.validaFecha($scope.fechaTerminoInterrupcion[item + 1]);
                if(fechaInterrupcionValida && fechaTerminoValida && 
                        ($scope.fechaTerminoInterrupcion[item + 1] != "1900-01-01 00:00:00") &&
                        ($scope.fechaTerminoInterrupcion[item + 1] != "1900-01-01")){
                    //calcular fechas de grilla
                    $scope.calculaInterrupcionTermino(item + 1);
    				
                } else if(fechaInterrupcionValida){
                    // calcular en con hora del mensaje
                    $scope.calculaInterrupcionMensaje(item + 1);
                }else{
                    $scope.tiempoInterrupcion[item + 1] = 0;
                }
            }
			
			
    	}
					
    	
    };
    
    $scope.calculaInterrupcionTermino = function(index){
    	
    	var f1 = $scope.fechaTerminoInterrupcion[index];
    	var f2 = $scope.fechaInterrupcion[index];
    	var ff1 = f1.split(" ");;
    	var fecha1 = ff1[0];
    	var fechaPartes1 = fecha1.split("-");;
    	var tiempo1 =ff1[1];
    	var tt1 = tiempo1.split(":");;
    	var ft1 = new Date(fechaPartes1[0], fechaPartes1[1] - 1, fechaPartes1[2], tt1[0], tt1[1], tt1[2] );;

    	var ff2 = f2.split(" ");
    	var fecha2 = ff2[0];
    	var fechaPartes2 = fecha2.split("-");
    	var tiempo2 = ff2[1];
    	var tt2 = tiempo2.split(":");
    	var ft2 = new Date(fechaPartes2[0], fechaPartes2[1] - 1, fechaPartes2[2], tt2[0], tt2[1], tt2[2] );


    	var valorFinal = ((ft1 - ft2) / 1000 / 60 / 60).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    	if(valorFinal < 0.009 ){
            valorFinal = 0;
    	}
    	$scope.tiempoInterrupcion[index] = valorFinal;
    };
    
    $scope.calculaInterrupcionMensaje = function(index){
    	
    	var  f1 = $scope.hora.glosa;
    	f1 = f1.replace(/\//g, '-');
    	var f2 = $scope.fechaInterrupcion[index];
    	var ff1 = f1.split(" ");;
    	var fecha1 = ff1[0];
    	var fechaPartes1 = fecha1.split("-");;
    	var tiempo1 =ff1[1];
    	var tt1 = tiempo1.split(":");;
    	var ft1 = new Date(fechaPartes1[0], fechaPartes1[1] - 1, fechaPartes1[2], tt1[0], tt1[1], tt1[2] );;

    	var ff2 = f2.split(" ");
    	var fecha2 = ff2[0];
    	var fechaPartes2 = fecha2.split("-");
    	var tiempo2 = ff2[1];
    	var tt2 = tiempo2.split(":");
    	var ft2 = new Date(fechaPartes2[0], fechaPartes2[1] - 1, fechaPartes2[2], tt2[0], tt2[1], tt2[2] );


    	var valorFinal = ((ft1 - ft2) / 1000 / 60 / 60).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    	if(valorFinal < 0.009 ){
            valorFinal = 0;
    	}
    	$scope.tiempoInterrupcion[index] = valorFinal;
    };
    
    function formatDate(date) {
        var year = date.getFullYear(),
                month = date.getMonth() + 1, // months are zero indexed
        monthFormatted = month < 10 ? "0" + month : month,
                day = date.getDate(),
    		dayFormatted = day < 10 ? "0" + day : day,
                hour = date.getHours(),
                hourFormatted = hour < 10 ? "0" + hour : hour; // hour returned in 24 hour format

        return year + "/" + monthFormatted + "/" + dayFormatted + " " + hourFormatted + ":" +
                "00:" + "00";
    }

    
    
    var horaActual = formatDate(new Date());
    var d3 = new Date();
    d3.setHours ( new Date().getHours() +1 );
    var horaSiguiente = formatDate(d3);
    $scope.mapHoras=[{"id":"1","glosa":horaActual},{"id":"2","glosa":horaSiguiente}];
    
    $scope.selCLEAR = function() {
        var keys = Object.keys($scope.filtroarr);
        for (var i = 0; i < keys.length; i++) {
            $scope.selCANCEL(keys[i]);
        }
    };

    $scope.selCHECK = function(filtros, valtable) {
        for (var i = 0; i < filtros.length; i++) {
            var filtro =  filtros[i];
            if (valtable == null && filtro.txt == "--VACIO--"){
                return filtro.val;
            } else if (filtro.txt == valtable) {
                return filtro.val;
            } 
        }
        return false;
    };
	
    $scope.reobtieneNumerosInterrupcion = function(){
        var payload = {"fechaMensaje": $scope.hora.glosa,
            "codSec" :  $scope.selectedItem.IEMP_CODIGOSEC};
        var cantidadHoy = 0;		
        $http.post('../rest/iieh/seq_numero_interrupcion', payload).then(function(response) {
    		
            cantidadHoy =  response.data[0]["cantidadHoy"];
            //$scope.numeroInterrupcion = response.data;
    		
            //$scope.numeroInterrupcion = [];
            var length = Object.keys($scope.numeroInterrupcion).length;
            var sum = 0;
            for (var i = 0; i < length; i++) {
                if($scope.records[i].selected == true){
                    var parts = $scope.hora.glosa.split(" ");
                    var part1 = parts[0]; // YYYY/MM/DD
                    var parts2 = part1.split("/");
                    var yy = parts2[0].substring(2, 4);
                    var mm = parts2[1];
                    var dd = parts2[2];
                    var s = "000" + (cantidadHoy + sum + 1 );
                    var numeroCompuesto = s.substr(s.length-3);
                    var strSecuenciaCompuesta = "" + $scope.selectedItem.IEMP_CODIGOSEC + yy + mm+dd + numeroCompuesto;
                    $scope.numeroInterrupcion[i] = strSecuenciaCompuesta;
                    sum++;
                }
				
            }
    	});
		
    };
    $scope.selFILTER = function(){
        var keys = Object.keys($scope.filtroarr);
        var regSeleccionados = 0;
        for (var i = 0; i < $scope.records.length; i++) {
            var currselected = true;
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                if ($scope.filtroarr[key].active == false)
                    continue;
                currselected = $scope.selCHECK($scope.filtroarr[key].filtros, $scope.records[i][key]);
				
                if (!currselected){
                    break;
                }else{
                    regSeleccionados++;
                }
					
            }
            $scope.records[i].selected = currselected;
        }
        $scope.totalAlimentadores = regSeleccionados;
        $scope.reobtieneNumerosInterrupcion();
    };
    $scope.selAPPLY = function(key) {
        $scope.filtroarr[key].active = true;
        $scope.selFILTER();
        $scope.selINIT(key, false, true);
        $scope.filtroarr[key].show = false;
    };
	
    $scope.selRESET = function(key) {
		
        $scope.filtroarr[key].active = false;
        $scope.selFILTER();
        $scope.filtroarr[key].show = false;
        $scope.totalAlimentadores = $scope.totalAlimentadoresTotal;
        $scope.cambiarMensaje();
    };
	
    $scope.selCANCEL = function(key) {
        if (!$scope.filtroarr[key].show)
            return;
        for (var i = 0; i < $scope.filtroarr[key].filtros.length; i++) {
            $scope.filtroarr[key].filtros[i].val = $scope.filtroarr[key].filtros[i].bkup;
            $scope.filtroarr[key].filtros[i].bkup = null;
        }
        $scope.selSET(key, false);
        $scope.filtroarr[key].show = false;
    };

    $scope.selSHOW = function(key) {
        if ($scope.filtroarr[key].show)
            return;
        $scope.selINIT(key, false, $scope.filtroarr[key].active);
        var keys = Object.keys($scope.filtroarr);
        for (var j = 0; j < keys.length; j++) {
            var ckey = keys[j];
            if (ckey == key)
                continue;
            $scope.selCANCEL(ckey);
        }
        for (var i = 0; i < $scope.filtroarr[key].filtros.length; i++) {
            $scope.filtroarr[key].filtros[i].bkup = $scope.filtroarr[key].filtros[i].val;
        }
        $scope.filtroarr[key].show = true;
    };

    $scope.selSET = function(key, all) {
        var cfiltro = $scope.filtroarr[key];
        if (all) {
            for (var i = 0; i < cfiltro.filtros.length; i++) {
                cfiltro.filtros[i].val = cfiltro.all;
            }
        } else {
            var allarrsel = true;
            for (var i = 0; i < cfiltro.filtros.length; i++) {
                allarrsel = allarrsel && cfiltro.filtros[i].val;
                if (!allarrsel)
                    break;
            }
            cfiltro.all = allarrsel;
        }
    };
	

    $scope.selINIT = function(key, reset, active) {
        var filtroset = new StringSet();
        for (var i = 0; i < $scope.records.length; i++) {
            if (!$scope.records[i].selected && !reset)
                continue;
            filtroset.add($scope.records[i][key]);
        }

        var values = filtroset.values();
        $scope.filtroarr[key] = {};
        $scope.filtroarr[key].all = true;
        $scope.filtroarr[key].show = false;
        $scope.filtroarr[key].active = active;
        $scope.filtroarr[key].filtros = [];
        for (var i = 0; i < values.length; i++) {
            $scope.filtroarr[key].filtros[i] = {};
            $scope.filtroarr[key].filtros[i].txt = values[i];
            $scope.filtroarr[key].filtros[i].val = true;
            $scope.filtroarr[key].filtros[i].bkup = null;
        }
    };

    $scope.selSTART = function() {
        $scope.filtroarr = [];
        $scope.selINIT("COMUNA", true, false);
        //$scope.selINIT("CONCESIONARIA", true, false);
        $scope.selINIT("SUBESTACION", true, false);
        $scope.selINIT("ALIMENTADOR", true, false);
        $scope.selINIT("NODO_OPERADO", true, false);
    }
	
    $scope.lstClass = function(index) {
        return ($scope.lstIndex == index) ? "info" : "";
    };
    
    $scope.lstSel = function(index) {
        if ($scope.lstIndex == -1)
            $scope.lstIndex = index;
        else
            $scope.lstIndex = -1;
    };
	
}

