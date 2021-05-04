function at_crear_fnc($rootScope, $scope, $routeParams, $http, $location) {
    $rootScope.link_vermsg = "";
    $rootScope.link_addmsg = "";
    $rootScope.link_verat = "active";
    
    $scope.numCoumnas = 0.0;
    $scope.totComunas = 0.0;
    $scope.perCoumnas = 0.0;
    $scope.arrComunas = [];
    $scope.atbase = [];
    $scope.numClientes = 0.0;
    $scope.totClientes = 0.0;
    $scope.perClientes = 0.0;
    
    $scope.numAlimentadores = 0.0;
    $scope.totAlimentadores = 0.0;
    $scope.perAlimentadores = 0.0;
    $scope.clientesEditar = [];
    $scope.numClientesOriginales = [];
    $scope.ocultaComboEmpresa = false;
    $scope.ocultaBotonAceptar = false;
    $scope.checked = false;
    $scope.tipoIncidenciasSeleccionada = 0;
    $scope.empresaSeleccionada = 0;
    $scope.ColumnasATOcultas = true;
    
    var t = $routeParams.t;
    var e = $routeParams.e;

    $scope.tipoIncidencia = [
        {name:'Seleccione tipo de incidencias', id:0},
        {name:'AT', id:1},
        {name:'MT/BT', id:2}
    ];
    
    $scope.selectedTipoIncidencia = $scope.tipoIncidencia[0];
    $scope.selectedEmpresa = [];
    
    $scope.empresasDuro = [
        {name:'ENEL Dx', id:10},
        {name:'Colina', id:12},
        {name:'Luz Andes', id:15}
    ];
    
    $scope.cargaFiltro = function(){
        if(typeof t != 'undefined' && t != null){
            //cambiar metodos anteriores de cambio
            var result = $scope.tipoIncidencia.filter(function(v) {
                return v.id === t; // Filter out the appropriate one
            })[0];
            $scope.selectedTipoIncidencia = result;
            if(t != "0"){
                
                if(typeof e != 'undefined' && e != null && e != "0"){
                     var result1 = $scope.empresasDuro.filter(function(v) {
                        return v.id === e; // Filter out the appropriate one
                    })[0];
                    $scope.selectedEmpresa = result1;
                }
            }
        }
    };
    
    $scope.cambiarTipoEmpresa = function(){
        $scope.limpiarVariables ();
        if($scope.selectedTipoIncidencia.id === 1 && $scope.selectedEmpresa.id === 10){
            $scope.cargarAT();
        }else if ($scope.selectedTipoIncidencia.id === 2){
            $scope.cargarMTBT();
        }
    };
    
    //error en admin, no carga la empresa al seleccionar mtbt en ventana previa
    $scope.cambiarTipoIncidencia = function(){
        $scope.limpiarVariables ();
        $http.get("../rest/iieh/permisos?usuario=" + $rootScope.username).then(function(response) {
            var mydata2 = response.data[0];
            $rootScope.permisoEsAdmin = mydata2["ES_ADMIN"];
            if($rootScope.permisoEsAdmin === 1){
                $rootScope.permisoValidador = 1;
                if($scope.selectedTipoIncidencia.id === 1){
                    $scope.empresasDuro = [
                        {name:'ENEL Dx', id:10}
                    ];
                    $scope.selectedEmpresa = $scope.empresasDuro[0];
                    $scope.ColumnasATOcultas = false;
                    $scope.cargarAT();
                } else{
                    $scope.empresasDuro = [
                        {name:'ENEL Dx', id:10},
                        {name:'Colina', id:12},
                        {name:'Luz Andes', id:15}
                    ];

                    $scope.ColumnasATOcultas = true;
                    
                    $scope.cargarMTBT();
                }
            } else{
                $rootScope.permisoEmpresa = mydata2["EMPRESA"];
                $rootScope.permisoAT = mydata2["PERMISOAT"];
                $rootScope.permisoMT = mydata2["PERMISOMT"];
                $rootScope.permisoBT = mydata2["PERMISOBT"];
                $rootScope.permisoValidador = mydata2["VALIDADOR"];
                if($rootScope.permisoEmpresa !== 10 && $scope.selectedTipoIncidencia.id === 1){
                    $scope.empresasDuro = [];
                } else{
                    if($rootScope.permisoEmpresa === 10){
                        $scope.empresasDuro = [
                            {name:'ENEL Dx', id:10}
                        ];
                    }
                    else if($rootScope.permisoEmpresa === 12){
                        $scope.empresasDuro = [
                            {name:'Colina', id:12}
                        ];
                    }
                    else if($rootScope.permisoEmpresa === 15){
                        $scope.empresasDuro = [
                            {name:'Luz Andes', id:15}
                        ];
                    }
                    $scope.selectedEmpresa = $scope.empresasDuro[0];
                    $scope.selectedEmpresa.id = $rootScope.permisoEmpresa;
                }

                if($scope.selectedTipoIncidencia.id === 0){
                    //solo limpar
                    $scope.records = [];
                } else if($scope.selectedTipoIncidencia.id === 1 && $rootScope.permisoEmpresa === 10){
                    // at
                    $scope.ColumnasATOcultas = false;
                    $scope.cargarAT();
                } else if($scope.selectedTipoIncidencia.id === 2){
                    //mt/bt
                    $scope.ColumnasATOcultas = true;
                        $scope.cargarMTBT();
                } else {
                    $scope.records = [];

                }
            }
            if($rootScope.permisoEsAdmin || $rootScope.permisoAT === 2 || 
                    $rootScope.permisoMT === 2 || $rootScope.permisoBT === 2){
                $scope.permisoEscritura = 1;
            }  
            
        });
    };
    $scope.despliegaCombosTipoEmpresa = function(empresa, permisoAT, permisoMT, permisoBT){
        if(empresa === 10){
            $scope.empresasDuro = [
                {name:'ENEL Dx', id:10}
            ];
        }
        else if(empresa === 12){
            $scope.empresasDuro = [
                {name:'Colina', id:12}
            ];
        }
        else if(empresa === 15){
            $scope.empresasDuro = [
                {name:'Luz Andes', id:15}
            ];
        }
        $scope.selectedEmpresa = $scope.empresasDuro[0];
        $scope.selectedEmpresa.id = empresa;


        if (permisoAT === 2 && (permisoMT === 2 || permisoBT === 2)){
            $scope.tipoIncidencia = [
                {name:'Seleccione tipo de incidencias', id:0},
                {name:'AT', id:1},
                {name:'MT/BT', id:2}
            ];
        } else if (permisoAT === 2 && (permisoMT !== 2 && permisoBT !== 2)){
            $scope.tipoIncidencia = [
                {name:'AT', id:1}
            ];
            if(empresa !== 10)
                $scope.empresasDuro = [];
        } else if (permisoAT !== 2 && (permisoMT === 2 || permisoBT === 2)){
            $scope.tipoIncidencia = [
                {name:'MT/BT', id:2}
            ];

        }
        if(typeof t != 'undefined' && t != null){
            //cambiar metodos anteriores de cambio
            var result = $scope.tipoIncidencia.filter(function(v) {
                return v.id === t; // Filter out the appropriate one
            })[0];
            $scope.selectedTipoIncidencia = result;
        }
        //$scope.selectedTipoIncidencia = $scope.tipoIncidencia[0];
    };
    
    $scope.fnPermisos = function(){
        $http.get("../rest/iieh/permisos?usuario=" + $rootScope.username).then(function(response) {
            var mydata2 = response.data[0];
            $rootScope.permisoEsAdmin = mydata2["ES_ADMIN"];
            if($rootScope.permisoEsAdmin === 1){
                $rootScope.permisoValidador = 1;
            } else{
                $rootScope.permisoEmpresa = mydata2["EMPRESA"];
                $rootScope.permisoAT = mydata2["PERMISOAT"];
                $rootScope.permisoMT = mydata2["PERMISOMT"];
                $rootScope.permisoBT = mydata2["PERMISOBT"];
                $rootScope.permisoValidador = mydata2["VALIDADOR"];
                $scope.despliegaCombosTipoEmpresa($rootScope.permisoEmpresa, 
                        $rootScope.permisoAT, $rootScope.permisoMT, $rootScope.permisoBT);
            }
            if($rootScope.permisoEsAdmin || $rootScope.permisoAT === 2 || 
                    $rootScope.permisoMT === 2 || $rootScope.permisoBT === 2){
                $scope.permisoEscritura = 1;
            }
            if(($rootScope.permisoEmpresa === 12 || $rootScope.permisoEmpresa === 15 || $rootScope.permisoEmpresa === 10) && 
                    $rootScope.permisoEsAdmin !== 1){
                //$scope.ocultaComboEmpresa = true;
                if($rootScope.permisoEmpresa === 10){
                    $scope.selectedEmpresa = $scope.empresasDuro[0];
                }
                else if($rootScope.permisoEmpresa === 12){
                    $scope.selectedEmpresa = $scope.empresasDuro[1];
                }
                else if($rootScope.permisoEmpresa === 15){
                    $scope.selectedEmpresa = $scope.empresasDuro[2];
                }
                
            }
            
        });
    };
    $scope.fnPermisos();
    
    $scope.cargarAT = function(){
        $http.get("../rest/iieh/alimentadores_at").then(function(response) {
            $scope.totAlimentadores = response.data.length;
            $http.get("../rest/iieh/clientes_at").then(function(response) {
                $scope.totClientes = response.data[0]["TOTCLI"];
                $http.get("../rest/iieh/comunas_at").then(function(response) {
                    $scope.totComunas = response.data.length;
                    $http.get("../rest/iieh/date").then(function(response) {
                        $scope.fechainterrupcion = response.data[0]["CURDATE"].trim() ;
			
			$scope.fechainterrupcion2 = $scope.fechainterrupcion.split(" ")[1] + " " + $scope.fechainterrupcion.split(" ")[0];

                        $http.get("../rest/iieh/at_parameter").then(function(response) {
                            $scope.atbase = response.data;
			    
                            var setComunasSel = new StringSet();
                            var length = $scope.atbase.length;
                            for (var i = 0; i < length; i++) {
                                $scope.atbase[i].selected = true;
				
                                setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
				$scope.clientesEditar[i] = $scope.atbase[i]["CANT_CLI"];
                            }
                            var nomcomunas = setComunasSel.values();
                            for (var i = 0; i < nomcomunas.length; i++ ){
                                $scope.arrComunas.push({"nom":nomcomunas[i], "sel": true});
                            }
                            $scope.selSTART();
                            $scope.recalcularResumen();	
				$scope.totalItems = length;		    
                        });
                    });
                });
            });
        });
    };
    
    $scope.cargarMTBT = function(){
        $http.get("../rest/iieh/listar_edicion_manual?id=" + $scope.selectedEmpresa.id).then(function(response) {
            $scope.atbase = response.data;

            $http.get("../rest/iieh/alimentadores_mtbt?id=" + $scope.selectedEmpresa.id).then(function(response) {
                $scope.totAlimentadores = response.data.length;
                $http.get("../rest/iieh/clientes_mtbt?id=" + $scope.selectedEmpresa.id).then(function(response) {
                    $scope.totClientes = response.data[0]["TOTCLI"];
                    $http.get("../rest/iieh/comunas_mtbt?id=" + $scope.selectedEmpresa.id).then(function(response) {
                        $scope.totComunas = response.data.length;
                        $http.get("../rest/iieh/date").then(function(response) {
                            $scope.fechainterrupcion = response.data[0]["CURDATE"].trim() ;
                            var setComunasSel = new StringSet();
                            var length = $scope.atbase.length;
                            for (var i = 0; i < length; i++) {
                                $scope.atbase[i].selected = true;
                                setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
$scope.clientesEditar[i] = $scope.atbase[i]["CANT_CLI"];
                            }
                            var nomcomunas = setComunasSel.values();
                            for (var i = 0; i < nomcomunas.length; i++) {
                                $scope.arrComunas.push({
                                    "nom" : nomcomunas[i],
                                    "sel" : true
                                });
                            }
                            $scope.selSTART();
                            $scope.recalcularResumen();
			$scope.totalItems = length;
                        });
                        
                    });
                });
            });
        }); 
    };

    $scope.recalcularResumen = function () {
        $scope.numCoumnas = 0.0;
        $scope.perCoumnas = 0.0;
        
        $scope.numClientes = 0.0;
        $scope.perClientes = 0.0;
        
        $scope.numAlimentadores = 0.0;
        $scope.perAlimentadores = 0.0;
        
        var setComunasSel = new StringSet();
        var setAlimentadoresSel = new StringSet(); 
        for (var i = 0; i < $scope.atbase.length; i++){
            $scope.numClientesOriginales[i] = $scope.atbase[i]["CANT_CLI"];
            if (!$scope.atbase[i].selected)
                continue;
            setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
            setAlimentadoresSel.add($scope.atbase[i]["ALIMENTADOR"]);
            $scope.numClientes += $scope.clientesEditar[i]; 
        }
        
        $scope.perClientes = 100 * $scope.numClientes / $scope.totClientes;
        $scope.perClientes = Math.round10($scope.perClientes, -2);
        
        $scope.numAlimentadores = setAlimentadoresSel.values().length;
        $scope.perAlimentadores = 100 * $scope.numAlimentadores / $scope.totAlimentadores;
        $scope.perAlimentadores = Math.round10($scope.perAlimentadores, -2);
        
        $scope.numCoumnas = setComunasSel.values().length;
        $scope.perCoumnas = 100 * $scope.numCoumnas / $scope.totComunas;
        $scope.perCoumnas = Math.round10($scope.perCoumnas, -2);
        
        for (var i = 0; i < $scope.totComunas; i++ ){
            $scope.arrComunas[i].sel = setComunasSel.contains($scope.arrComunas[i].nom);
        }
    };
    
    $scope.clientesModificar = function () {
        $scope.numCoumnas = 0.0;
        $scope.perCoumnas = 0.0;
        
        $scope.numClientes = 0.0;
        $scope.perClientes = 0.0;
        
        $scope.numAlimentadores = 0.0;
        $scope.perAlimentadores = 0.0;
        
        var setComunasSel = new StringSet();
        var setAlimentadoresSel = new StringSet(); 
	
        for (var i = 0; i < $scope.atbase.length; i++){
            if (!$scope.atbase[i].selected)
                continue;
            setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
            setAlimentadoresSel.add($scope.atbase[i]["ALIMENTADOR"]);
            if($scope.clientesEditar[i] === ""){
                $scope.clientesEditar[i] = 0;
            }
            if($scope.TryParseInt($scope.clientesEditar[i], 0) > $scope.numClientesOriginales[i]){
                $scope.clientesEditar[i] = $scope.numClientesOriginales[i];
            }
            $scope.numClientes += $scope.TryParseInt($scope.clientesEditar[i], 0);
	    
            
        }
        
        $scope.perClientes = 100 * $scope.numClientes / $scope.totClientes;
        $scope.perClientes = Math.round10($scope.perClientes, -2);
        
        $scope.numAlimentadores = setAlimentadoresSel.values().length;
        $scope.perAlimentadores = 100 * $scope.numAlimentadores / $scope.totAlimentadores;
        $scope.perAlimentadores = Math.round10($scope.perAlimentadores, -2);
        
        $scope.numCoumnas = setComunasSel.values().length;
        $scope.perCoumnas = 100 * $scope.numCoumnas / $scope.totComunas;
        $scope.perCoumnas = Math.round10($scope.perCoumnas, -2);
        
        for (var i = 0; i < $scope.totComunas; i++ ){
            $scope.arrComunas[i].sel = setComunasSel.contains($scope.arrComunas[i].nom);
        }
    }
    
    $scope.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    
    $scope.TryParseInt = function (str,defaultValue) {
        var retValue = defaultValue;
        if(str !== null) {
            if($scope.isNumber(str)){
                 return parseInt(str);
            }
            if(str.length > 0) {
                if (!isNaN(str)) {
                    retValue = parseInt(str);
                }
            } else{
                return 0;
            }
        }
        return retValue;
    };
    
    $scope.selCLEAR = function() {
        var keys = Object.keys($scope.filtroarr);
        for (var i = 0; i < keys.length; i++) {
            $scope.selCANCEL(keys[i]);
        }
    }
    
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
    }
    
    $scope.selFILTER = function(){
	var count = 0;
        var keys = Object.keys($scope.filtroarr);
        for (var i = 0; i < $scope.atbase.length; i++) {
            var currselected = true;
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                if ($scope.filtroarr[key].active == false)
                    continue;
                currselected = $scope.selCHECK($scope.filtroarr[key].filtros, $scope.atbase[i][key]);
                if (!currselected)
                    break;
            }
            $scope.atbase[i].selected = currselected;
		if (currselected == true)
		count++;
        }
$scope.totalItems = count;
    }
    
    $scope.selAPPLY = function(key) {
        $scope.filtroarr[key].active = true;
        $scope.selFILTER();
        $scope.selINIT(key, false, true);
        $scope.filtroarr[key].show = false;
        $scope.recalcularResumen();
    }
    
    $scope.selRESET = function(key) {
        $scope.filtroarr[key].active = false;
        $scope.selFILTER();
        $scope.filtroarr[key].show = false;
        //$scope.recalcularResumen();
        
        if($scope.selectedEmpresa.id === 10){
            $scope.simularAT();
        } else{
            $scope.simular();
        }
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
    }
    
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
    }
    
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
    }
    
    $scope.selINIT = function(key, reset, active) {
        var filtroset = new StringSet();
        for (var i = 0; i < $scope.atbase.length; i++) {
            if (!$scope.atbase[i].selected && !reset)
                continue;
            filtroset.add($scope.atbase[i][key]);
        }
        
        var values = filtroset.values();
        $scope.filtroarr[key] = {};
        $scope.filtroarr[key].all = true;
        $scope.filtroarr[key].show = false;
        $scope.filtroarr[key].active = active;
        $scope.filtroarr[key].filtros = [];
        for (var i =0; i < values.length; i ++){
            $scope.filtroarr[key].filtros[i] = {};
            $scope.filtroarr[key].filtros[i].txt = values[i];
            $scope.filtroarr[key].filtros[i].val = true;
            $scope.filtroarr[key].filtros[i].bkup = null;
        }
    }
    
    $scope.selSTART = function() {
        $scope.filtroarr = [];
        $scope.selINIT("LINEA", true, false);
        $scope.selINIT("CTO", true, false);
        $scope.selINIT("BARRA", true, false);
        $scope.selINIT("BF", true, false);
        $scope.selINIT("SDAC", true, false);
        $scope.selINIT("CE", true, false);
        $scope.selINIT("SUBESTACION", true, false);
        $scope.selINIT("ALIMENTADOR", true, false);
    }
    
    $scope.limpiarVariables = function(){
        
        $scope.arrComunas = [];
        $scope.numCoumnas = 0.0;
        $scope.totComunas = 0.0;
        $scope.perCoumnas = 0.0;
        $scope.arrComunas = [];

        $scope.numClientes = 0.0;
        $scope.totClientes = 0.0;
        $scope.perClientes = 0.0;

        $scope.numAlimentadores = 0.0;
        $scope.totAlimentadores = 0.0;
        $scope.perAlimentadores = 0.0;
        $scope.atbase = [];
        $scope.ColumnasATOcultas = true; 
    };
    
    $scope.aceptar = function() {
        $http.get("../rest/iieh/date").then(function(response) {
            try {
                var ahora = str2Date(response.data[0]["CURDATE"].trim()) ;
                var inter = str2Date($scope.fechainterrupcion);
                if (inter.getTime() < ahora.getTime()){
                    var dataGuardar = $scope.atbase;
			
                    for (var i = 0; i < $scope.atbase.length; i++){
                        if (!$scope.atbase[i].selected)
			{
                            dataGuardar[i]["selected"] = false;
				continue;
			}
                        if ($scope.clientesEditar[i] === "0")
                            dataGuardar[i]["selected"] = false;
                        dataGuardar[i]["CANT_CLI"] = $scope.clientesEditar[i];
			if($scope.selectedTipoIncidencia.id != 2){
			if(document.getElementById("FechaGeneral").checked)
			dataGuardar[i]["FECHA_ESTIMADA_REPOSICION"] = document.getElementById("fechainterrupcion2").value;
			
			var arr = dataGuardar[i]["FECHA_ESTIMADA_REPOSICION"].split(" ");
			dataGuardar[i]["FECHA_ESTIMADA_REPOSICION"] = arr[1] + " " + arr[0];
			}
                    }
                    var payload = {};
                    if($scope.selectedTipoIncidencia.id === 2){
                        payload = {"fechainterrupcion": $scope.fechainterrupcion,"descripcion" : $scope.DESCRIPCION, "data" : dataGuardar, "mtbt" : 1,"empresa": $scope.selectedEmpresa.id};
                    } else{
                        payload = {"fechainterrupcion": $scope.fechainterrupcion,"descripcion" : $scope.DESCRIPCION, "data" : dataGuardar, "empresa":$scope.selectedEmpresa.id};
                    }
                    
                    if($scope.ocultaBotonAceptar === false){
                        $http.put('../rest/iieh/mensaje_at', payload).then(function (response) {
                            $location.path("/at_listar");
                        }, function () {
                            $location.path("/at_listar");
                        });
                    }
                    
                }else{
                    $scope.msgCuerpo = "La fecha/hora es mayor que la actual.";
                    $("#ModalError").modal({}).draggable();
                    
                }
            } catch (e){
                $scope.msgCuerpo = "Revise las fechas.";
                $("#ModalError").modal({}).draggable();
                return;
            }
        });
    };
    
    $scope.cancelar = function() {
        $location.path("/at_listar");
    };
    
    
    
    $scope.cargaFechaActual = function(){
        $http.get("../rest/iieh/date").then(function(response) {
            $scope.fechainterrupcion = response.data[0]["CURDATE"].trim() ;
        });
    };
    

    $scope.cargaFiltroPagPrevia = function(tipo, empresa){
        $scope.limpiarVariables ();
        //$scope.fnPermisos();
		var simularAt = true;
        $http.get("../rest/iieh/permisos?usuario=" + $rootScope.username).then(function(response) {
            var mydata2 = response.data[0];
            $rootScope.permisoEsAdmin = mydata2["ES_ADMIN"];
            if($rootScope.permisoEsAdmin === 1){
                $rootScope.permisoValidador = 1;
            } else{
                $rootScope.permisoEmpresa = mydata2["EMPRESA"];
                $rootScope.permisoAT = mydata2["PERMISOAT"];
                $rootScope.permisoMT = mydata2["PERMISOMT"];
                $rootScope.permisoBT = mydata2["PERMISOBT"];
                $rootScope.permisoValidador = mydata2["VALIDADOR"];
            }
            if($rootScope.permisoEsAdmin || $rootScope.permisoAT === 2 || 
                    $rootScope.permisoMT === 2 || $rootScope.permisoBT === 2){
                $scope.permisoEscritura = 1;
            }
            
            if(tipo === 0){
                //solo limpar
            } else if(tipo === 1){
                // at
                $scope.empresasDuro = [
                    {name:'ENEL Dx', id:10}
                ];
                $scope.selectedEmpresa = $scope.empresasDuro[0];
                
                $scope.ColumnasATOcultas = false;
            } else{
                //mt/bt
                if(($rootScope.permisoEmpresa === 12 || $rootScope.permisoEmpresa === 15 ||
                        $rootScope.permisoEmpresa === 10) && 
                        $rootScope.permisoEsAdmin !== 1){
                    //$scope.ocultaComboEmpresa = true;
                    $scope.ColumnasATOcultas = true;
                    
                    if(empresa === 10){
                        $scope.empresasDuro = [
                            {name:'ENEL Dx', id:10}
                        ];
                    }
                    else if(empresa === 12){
                        $scope.empresasDuro = [
                            {name:'Colina', id:12}
                        ];
                    }
                    else if(empresa === 15){
                        $scope.empresasDuro = [
                            {name:'Luz Andes', id:15}
                        ];
                    }
                    $scope.selectedEmpresa = $scope.empresasDuro[0];
                    simularAt = false;
                } else{
                    if($rootScope.permisoEsAdmin !== 1){
                        $scope.empresasDuro = [
                            {name:'Colina', id:12},
                            {name:'Luz Andes', id:15}
                        ];  
                        if(empresa === 12){
                                $scope.selectedEmpresa = $scope.empresasDuro[0];
                        } else {
                                $scope.selectedEmpresa = $scope.empresasDuro[1];
                        } 					
                        $scope.ColumnasATOcultas = true;
                        simularAt = false;
                    } else{
                        $scope.empresasDuro = [
                            {name:'ENEL Dx', id:10},
                            {name:'Colina', id:12},
                            {name:'Luz Andes', id:15}
                        ];  
                        if(empresa === 10){
                            $scope.selectedEmpresa = $scope.empresasDuro[0];
                        }
                        else if(empresa === 12){
                            $scope.selectedEmpresa = $scope.empresasDuro[1];
                        }
                        else if(empresa === 15){
                            $scope.selectedEmpresa = $scope.empresasDuro[2];
                        }
                        $scope.ColumnasATOcultas = true;
                        simularAt = false;
                    }
                    
                }   
            }
            if(simularAt){
                    $scope.cargarAT();
            } else{
                    $scope.cargarMTBT();
            }
        });
    };
    
	
$scope.viewby = 20;
  $scope.totalItems = $scope.atbase.length;
 $scope.currentPage = 4; 
$scope.itemsPerPage = $scope.viewby;
 $scope.maxSize = 5; //Number of pager buttons to show
 $scope.setPage = function (pageNo) {    
$scope.currentPage = pageNo; 
 };  
$scope.pageChanged = function() {    
console.log('Page changed to: ' + $scope.currentPage); 
 };
$scope.setItemsPerPage = function(num) {
  $scope.itemsPerPage = num;  
$scope.currentPage = 1; //reset to first page
}
	
	
    if(typeof t != 'undefined' && t != null){
        //cambiar metodos anteriores de cambio
        var result = $scope.tipoIncidencia.filter(function(v) {
            return v.id === t; // Filter out the appropriate one
        })[0];
        $scope.selectedTipoIncidencia = result;
        if(t != "0"){
            //$scope.cambiarTipoIncidencia();
            if(typeof e != 'undefined' && e != null && e != "0"){
//                 var result1 = $scope.empresasDuro.filter(function(v) {
//                    return v.id === e; // Filter out the appropriate one
//                })[0];
                //$scope.cambiarTipoEmpresa(e);
                $scope.cargaFiltroPagPrevia(t,e);
            }
        }
    }
}