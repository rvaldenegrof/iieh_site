function at_simular_fnc($rootScope, $scope, $routeParams, $http, $location) {
    $rootScope.link_vermsg = "";
    $rootScope.link_addmsg = "";
    $rootScope.link_verat = "active";
    $rootScope.link_valinci = "";
    
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
    
    $scope.clientesEditar = [];
    $scope.numClientesOriginales = [];
    $scope.ColumnasATOcultas = true;
//    $scope.ocultaComboEmpresa = false;
    $scope.selectedEmpresa = [];
    
    $scope.tipoIncidencia = [
        {name:'Seleccione tipo de incidencias', id:0},
        {name:'AT', id:1},
        {name:'MT/BT', id:2}
    ];
    $scope.selectedTipoIncidencia = $scope.tipoIncidencia[0];
    
    $scope.empresasDuro = [
        {name:'ENEL Dx', id:10},
        {name:'Colina', id:12},
        {name:'Luz Andes', id:15}
    ];
    
    var t = $routeParams.t;
    var e = $routeParams.e;
    
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


        if (permisoAT > 0 && (permisoMT > 0 || permisoBT > 0)){
            $scope.tipoIncidencia = [
                {name:'Seleccione tipo de incidencias', id:0},
                {name:'AT', id:1},
                {name:'MT/BT', id:2}
            ];
        } else if (permisoAT > 0 && (permisoMT === 0 && permisoBT === 0)){
            $scope.tipoIncidencia = [
                {name:'AT', id:1}
            ];
            if(empresa !== 10)
                $scope.empresasDuro = [];
        } else if (permisoAT === 0 && (permisoMT > 0 || permisoBT > 0)){
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
                
                $scope.selectedEmpresa = $scope.empresasDuro[0];
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
                    $scope.simularAT();
                } else{
                    $scope.empresasDuro = [
                        {name:'ENEL Dx', id:10},
                        {name:'Colina', id:12},
                        {name:'Luz Andes', id:15}
                    ];
                    
                    $scope.ColumnasATOcultas = true;
                    
                    $scope.simular();
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
                    $scope.simularAT();
                } else if($scope.selectedTipoIncidencia.id === 2){
                    //mt/bt
                    $scope.ColumnasATOcultas = true;
                    $scope.simular();
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
    $scope.cambiarTipoEmpresa = function(empresa){
        $scope.limpiarVariables ();
        //$scope.fnPermisos();
//        if(empresa === 12){
//            $scope.selectedEmpresa = $scope.empresasDuro[0];
//            $scope.simular();
//        } else {
//            $scope.selectedEmpresa = $scope.empresasDuro[1];
//            $scope.simular();
//        } 
        if($scope.selectedTipoIncidencia.id === 1 && $scope.selectedEmpresa.id === 10){
            $scope.simularAT();
        }else if ($scope.selectedTipoIncidencia.id === 2){
            $scope.simular();
        }
    };
    
    $http.get("../rest/iieh/empresas").then(function(response) {
        $scope.empresas = response.data;
        for (var i = 0; i < $scope.empresas.length; i++) {
            if ($scope.empresas[i].IEMP_CODIGOSEC === 15) {
                $scope.empresas[i].IEMP_NOMBRE = "LUZ ANDES";
                break;
            }
        }
    });
    
    
    
    $scope.simularAT = function(){
        $http.get("../rest/iieh/alimentadores_at").then(function(response) {
            $scope.totAlimentadores = response.data.length;
            $http.get("../rest/iieh/clientes_at").then(function(response) {
                $scope.totClientes = response.data[0]["TOTCLI"];
                $http.get("../rest/iieh/comunas_at").then(function(response) {
                    $scope.totComunas = response.data.length;
                    $http.get("../rest/iieh/date").then(function(response) {
                        $scope.fechainterrupcion = response.data[0]["CURDATE"].trim();
                        $http.get("../rest/iieh/at_parameter").then(function(response) {
                            $scope.atbase = response.data;
                            var setComunasSel = new StringSet();
                            var length = $scope.atbase.length;
                            for (var i = 0; i < length; i++) {
                                $scope.atbase[i].selected = true;
                                setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
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
                        });
                    });
                });
            });
        });
    };
  
    $scope.simular = function(){
        
        $http.get("../rest/iieh/listar_edicion_manual?id=" + $scope.selectedEmpresa.id).then(function(response) {
            $scope.atbase = response.data;
            
            $http.get("../rest/iieh/alimentadores_mtbt?id=" + $scope.selectedEmpresa.id).then(function(response) {
                $scope.totAlimentadores = response.data.length;
                $http.get("../rest/iieh/clientes_mtbt?id=" + $scope.selectedEmpresa.id).then(function(response) {
                    $scope.totClientes = response.data[0]["TOTCLI"];
                    $http.get("../rest/iieh/comunas_mtbt?id=" + $scope.selectedEmpresa.id).then(function(response) {
                        $scope.totComunas = response.data.length;
                        var setComunasSel = new StringSet();
                        var length = $scope.atbase.length;
                        for (var i = 0; i < length; i++) {
                            $scope.atbase[i].selected = true;
                            setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
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
                    });
                });
            });
            
            
        });
    };
    
    $scope.clientesModificar = function(){
        
        $scope.numCoumnas = 0.0;
        $scope.perCoumnas = 0.0;
        
        $scope.numClientes = 0.0;
        $scope.perClientes = 0.0;
        
        $scope.numAlimentadores = 0.0;
        $scope.perAlimentadores = 0.0;
        
        var setComunasSel = new StringSet();
        var setAlimentadoresSel = new StringSet();
        var contClientesEditar = 0;
        for (var i = 0; i < $scope.atbase.length; i++) {
            if (!$scope.atbase[i].selected)
                continue;
            setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
            setAlimentadoresSel.add($scope.atbase[i]["ALIMENTADOR"]);
            if($scope.TryParseInt($scope.clientesEditar[i], 0) > $scope.numClientesOriginales[i]){
                $scope.clientesEditar[i] = $scope.numClientesOriginales[i];
            }
            $scope.numClientes += $scope.TryParseInt($scope.clientesEditar[i], 0);
            contClientesEditar += contClientesEditar;
        }
        
        $scope.perClientes = 100 * $scope.numClientes / $scope.totClientes;
        $scope.perClientes = Math.round10($scope.perClientes, -2);
        
        $scope.numAlimentadores = setAlimentadoresSel.values().length;
        $scope.perAlimentadores = 100 * $scope.numAlimentadores / $scope.totAlimentadores;
        $scope.perAlimentadores = Math.round10($scope.perAlimentadores, -2);
        
        $scope.numCoumnas = setComunasSel.values().length;
        $scope.perCoumnas = 100 * $scope.numCoumnas / $scope.totComunas;
        $scope.perCoumnas = Math.round10($scope.perCoumnas, -2);
        
        for (var i = 0; i < $scope.totComunas; i++) {
            $scope.arrComunas[i].sel = setComunasSel.contains($scope.arrComunas[i].nom);
        }
    };
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

    $scope.recalcularResumen = function() {
        $scope.numCoumnas = 0.0;
        $scope.perCoumnas = 0.0;
        
        $scope.numClientes = 0.0;
        $scope.perClientes = 0.0;
        
        $scope.numAlimentadores = 0.0;
        $scope.perAlimentadores = 0.0;
        
        var setComunasSel = new StringSet();
        var setAlimentadoresSel = new StringSet();
        for (var i = 0; i < $scope.atbase.length; i++) {
            $scope.numClientesOriginales[i] = $scope.atbase[i]["CANT_CLI"];
            if (!$scope.atbase[i].selected)
                continue;
                
            setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
            setAlimentadoresSel.add($scope.atbase[i]["ALIMENTADOR"]);
            $scope.numClientes += $scope.atbase[i]["CANT_CLI"];
        }
        
        $scope.perClientes = 100 * $scope.numClientes / $scope.totClientes;
        $scope.perClientes = Math.round10($scope.perClientes, -2);
        
        $scope.numAlimentadores = setAlimentadoresSel.values().length;
        $scope.perAlimentadores = 100 * $scope.numAlimentadores / $scope.totAlimentadores;
        $scope.perAlimentadores = Math.round10($scope.perAlimentadores, -2);
        
        $scope.numCoumnas = setComunasSel.values().length;
        $scope.perCoumnas = 100 * $scope.numCoumnas / $scope.totComunas;
        $scope.perCoumnas = Math.round10($scope.perCoumnas, -2);
        
        for (var i = 0; i < $scope.totComunas; i++) {
            $scope.arrComunas[i].sel = setComunasSel.contains($scope.arrComunas[i].nom);
        }
    }
    
    $scope.selCLEAR = function() {
        var keys = Object.keys($scope.filtroarr);
        for (var i = 0; i < keys.length; i++) {
            $scope.selCANCEL(keys[i]);
        }
    }
    
    $scope.selCHECK = function(filtros, valtable) {
        for (var i = 0; i < filtros.length; i++) {
            var filtro = filtros[i];
            if (valtable == null && filtro.txt == "--VACIO--") {
                return filtro.val;
            } else if (filtro.txt == valtable) {
                return filtro.val;
            }
        }
        return false;
    }
    
    $scope.selFILTER = function() {
        var keys = Object.keys($scope.filtroarr);
        var key ;
        var size =  $scope.atbase.length;
        for (var i = 0; i < size; i++) {
            $scope.atbase[i].selected = true;
        }
        for (var j = 0; j < keys.length; j++) {
            key = keys[j];
            if (!$scope.filtroarr[key].active)
                continue;
            for (var i = 0; i < size; i++) {
                if ($scope.atbase[i].selected)
                    $scope.atbase[i].selected = $scope.selCHECK($scope.filtroarr[key].filtros, $scope.atbase[i][key]);
            }
        };
    }
    
    $scope.selAPPLY = function(key) {
        $scope.filtroarr[key].active = true;
        $scope.selFILTER();
        $scope.selINIT(key, false, true);
        $scope.filtroarr[key].show = false;
        
        $scope.recalcularResumen();
        $scope.clientesModificar();
        
    }
    
    $scope.selRESET = function(key) {
        $scope.filtroarr[key].active = false;
        $scope.selFILTER();
        $scope.filtroarr[key].show = false;

        if($scope.selectedEmpresa.id === 10){
            $scope.simularAT();
        } else{
            $scope.simular();
        }
        
//        $scope.recalcularResumen();
//        $scope.clientesModificar();
  
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
        for (var i = 0; i < values.length; i++) {
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
    
    $scope.aceptar = function() {
        $http.get("../rest/iieh/date").then(function(response) {
            try {
                var ahora = str2Date(response.data[0]["CURDATE"].trim());
                var inter = str2Date($scope.fechainterrupcion);
                if (inter.getTime() < ahora.getTime()) {
                    var payload = {
                        "fechainterrupcion" : $scope.fechainterrupcion,
                        "data" : $scope.atbase
                    };
                    $http.put('../rest/iieh/mensaje_at', payload).then(function() {
                        $location.path("/at_listar");
                    }, function() {
                        $location.path("/at_listar");
                    });
                } else {
                    $scope.msgCuerpo = "La fecha/hora es mayor que la actual.";
                    $("#ModalError").modal({}).draggable();
                }
            } catch (e) {
                $scope.msgCuerpo = "Revise las fechas.";
                $("#ModalError").modal({}).draggable();
                return;
            }
        });
    };
    $scope.cancelar = function() {
        $location.path("/at_listar").search({t: null, e:null});
    };
    
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
                    simularAt = false;
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
                    $scope.simularAT();
            } else{
                    $scope.simular();
            }
        });
    };
    
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