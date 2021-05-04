function at_listar_fnc($rootScope, $scope, $routeParams, $http, $location) {
	$rootScope.link_vermsg = "";
	$rootScope.link_addmsg = "";
	$rootScope.link_verat = "active";
	$rootScope.link_agrmsg = "";
	$rootScope.link_valinci = "";
        $rootScope.link_repcorte = "";
        
	$scope.lstIndex = -1;
	$scope.detalle = 'hidden';

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
        
        $scope.permisoEscritura = 0;
	//$scope.ocultaComboEmpresa = false;
        
//        $scope.tipoIncidencia = [
//            {name:'Seleccione tipo de incidencias', id:0},
//            {name:'AT', id:1},
//            {name:'MT/BT', id:2}
//        ];
//
//        
//        $scope.selectedTipoIncidencia = $scope.tipoIncidencia[0];
//
//        $scope.empresasDuro = [
//            {name:'ENEL Dx', id:10},
//            {name:'Colina', id:12},
//            {name:'Luz Andes', id:15}
//        ];

        $scope.fnPermisos = function(){
            $http.get("../rest/iieh/permisos?usuario=" + $rootScope.username).then(function(response) {
                var mydata2 = response.data[0];
                $rootScope.permisoEsAdmin = mydata2["ES_ADMIN"];
                if($rootScope.permisoEsAdmin === 1){
                    $rootScope.permisoValidador = 1;
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
                    $scope.selectedEmpresa = $scope.empresasDuro[0];
                } else{
                    $rootScope.permisoEmpresa = mydata2["EMPRESA"];
                    $rootScope.permisoAT = mydata2["PERMISOAT"];
                    $rootScope.permisoMT = mydata2["PERMISOMT"];
                    $rootScope.permisoBT = mydata2["PERMISOBT"];
                    $rootScope.permisoValidador = mydata2["VALIDADOR"];
                    $scope.despliegaCombosTipoEmpresa($rootScope.permisoEmpresa, 
                        $rootScope.permisoAT, $rootScope.permisoMT, $rootScope.permisoBT);
                    $scope.cambiarTipoEmpresa($rootScope.permisoEmpresa);
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
            $scope.selectedTipoIncidencia = $scope.tipoIncidencia[0];
            
        };
        $scope.fnPermisos();
        
        
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
            
        });


                

        $scope.cambiarTipoEmpresa = function(empresa){
            $scope.limpiarVariables ();
            if($scope.selectedTipoIncidencia.id === 1 && empresa === 10){
                $scope.simular();
            }else if ($scope.selectedTipoIncidencia.id === 2){
                $scope.simular();
            }
        };
        $scope.cambiarTipoIncidencia = function(){
            $scope.limpiarVariables ();
            
            $http.get("../rest/iieh/permisos?usuario=" + $rootScope.username).then(function(response) {
                var mydata2 = response.data[0];
                $rootScope.permisoEsAdmin = mydata2["ES_ADMIN"];
                if($rootScope.permisoEsAdmin === 1){
                    $rootScope.permisoValidador = 1;
                    $scope.permisoEscritura = 1;
                    if($scope.selectedTipoIncidencia.id === 1){
                        $scope.empresasDuro = [
                            {name:'ENEL Dx', id:10}
                        ];
                        $scope.selectedEmpresa = $scope.empresasDuro[0];
                        $scope.ColumnasATOcultas = false;
                        $scope.simular();
                    } else{
                        $scope.empresasDuro = [
                            {name:'ENEL Dx', id:10},
                            {name:'Colina', id:12},
                            {name:'Luz Andes', id:15}
                        ];
                        $scope.selectedEmpresa = $scope.empresasDuro[0];
                        $scope.ColumnasATOcultas = true;
                        $scope.simular();
                    }

                } else{
                    $rootScope.permisoEmpresa = mydata2["EMPRESA"];
                    $rootScope.permisoAT = mydata2["PERMISOAT"];
                    $rootScope.permisoMT = mydata2["PERMISOMT"];
                    $rootScope.permisoBT = mydata2["PERMISOBT"];
                    $rootScope.permisoValidador = mydata2["VALIDADOR"];
                    
                    //permiso escritura
                    if($scope.selectedTipoIncidencia.id === 1 && $rootScope.permisoAT === 2){
                            $scope.permisoEscritura = 1;
                    } else if ($scope.selectedTipoIncidencia.id === 2 && ($rootScope.permisoMT === 2 || $rootScope.permisoBT === 2)){
                            $scope.permisoEscritura = 1;
                    } else{
                            $scope.permisoEscritura = 0;
                    }
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
                        $scope.simular();
                    } else if($scope.selectedTipoIncidencia.id === 2){
                        //mt/bt
    //                    if(($rootScope.permisoEmpresa === 12 || $rootScope.permisoEmpresa === 15 || $rootScope.permisoEmpresa === 10) && 
    //                            $rootScope.permisoEsAdmin !== 1){
    //                        $scope.ColumnasATOcultas = true;
    //                        $scope.simularMtbt($scope.selectedEmpresa.id);
    //                    } else{
    //                        $scope.ColumnasATOcultas = true;
    //                        $scope.simularMtbt(12);
    //                    }
                        $scope.ColumnasATOcultas = true;
                            $scope.simular($scope.selectedEmpresa.id);
                    } else {
                        $scope.records = [];

                    }
                }
                //if($rootScope.permisoEsAdmin || $rootScope.permisoAT === 2 || 
                //        $rootScope.permisoMT === 2 || $rootScope.permisoBT === 2){
                //    $scope.permisoEscritura = 1;
                //}  
                
            });
        };
        
        $scope.simular = function(){
            var t = $scope.selectedTipoIncidencia.id;
            var e = $scope.selectedEmpresa.id;
            $http.get("../rest/iieh/mensaje_atmtbt?tipoIncidencia=" + t + "&empresa=" + e).then(function(response) {
		$scope.records = response.data;
            });    
        };
        $scope.simularAT = function(){
            $http.get("../rest/iieh/mensaje_soloat").then(function(response) {
		$scope.records = response.data;
            });    
        };
        $scope.simularMtbt = function(indice){
            $http.get("../rest/iieh/mensaje_mtbt?id=" + indice).then(function(response) {
		$scope.records = response.data;
            });
        };
	$scope.lstClass = function(index) {
		return ($scope.lstIndex == index) ? "info" : "";
	}
        $scope.lstSel = function(index) {

            if ($scope.lstIndex == index) {
                $scope.lstIndex = -1;
                $scope.detalle = 'hidden';
            } else {
                $scope.lstIndex = index;
                $scope.detalle = 'show';
                $scope.USUARIOCREA = $scope.records[$scope.lstIndex]["USUARIOCREA"];
                $scope.USUARIOMODIFICA = $scope.records[$scope.lstIndex]["USUARIOMODIFICA"];
                $scope.FECHACREA = $scope.records[$scope.lstIndex]["FECHACREA"];
                $scope.FECHAMODIFICA = $scope.records[$scope.lstIndex]["FECHAMODIFICA"];
                $scope.FECHAINTERRUPCION = $scope.records[$scope.lstIndex]["FECHAINTERRUPCION"];



                $http.get("../rest/iieh/empresa_x_alimentador?numinterrupcion=-" + $scope.records[$scope.lstIndex]["NUMEROINTERRUPCION"]).then(function(response) {
                    $scope.empresaListar = response.data[0]["EMPRESA"];
                    if($scope.empresaListar == 10){
                        $scope.listarAT(index);
                    } else{
                        $scope.listarMTBT(index);
                    }
                });

            };
        };
        
        $scope.listarAT = function(index){
            $http.get("../rest/iieh/at_inci_detail?id=-" + $scope.records[$scope.lstIndex]["NUMEROINTERRUPCION"]).then(function(response) {
                $scope.detail = response.data;
                for (var i = 0; i < $scope.detail.length; i++) {
                    var key = $scope.detail[i]["CKEY"];
                    var value = $scope.detail[i]["CVALUE"];
                    if (key == "NUMCOMUNAS") {
                        $scope.numCoumnas = parseInt(value);
                    } else if (key == "NUMCLIENTE") {
                        $scope.numClientes = parseInt(value);
                    } else if (key == "NUMALIMENTADORES") {
                        $scope.numAlimentadores = parseInt(value);
                    } else if (key == "TOTCOMUNAS") {
                        $scope.totComunas = parseInt(value);
                    } else if (key == "TOTCLIENTE") {
                        $scope.totClientes = parseInt(value);
                    } else if (key == "TOTALIMENTADORES") {
                        $scope.totAlimentadores = parseInt(value);
                    } else if (key == "LASTFECHATERMINOINTERRUPCION") {
                        $scope.LASTFECHATERMINOINTERRUPCION = value;
                    } else if (key == "DESCRIPCION"){ 
                        $scope.DESCRIPCION = value;
                    }
                }
                
                $scope.perCoumnas = 100 * $scope.numCoumnas / $scope.totComunas;
                $scope.perCoumnas = Math.round10($scope.perCoumnas, -2);
                
                $scope.perClientes = 100 * $scope.numClientes / $scope.totClientes;
                $scope.perClientes = Math.round10($scope.perClientes, -2);
                
                $scope.perAlimentadores = 100 * $scope.numAlimentadores / $scope.totAlimentadores;
                $scope.perAlimentadores = Math.round10($scope.perAlimentadores, -2);
            });
            $http.get("../rest/iieh/at_inci_comunas?id=-" + $scope.records[$scope.lstIndex]["NUMEROINTERRUPCION"]).then(function(response) {
                $scope.arrComunas = [];
                for (var i = 0; i < response.data.length; i++) {
                    $scope.arrComunas.push({"nom": response.data[i]["ICOM_NOMBRE"], "sel": (response.data[i]["EVAL"] == 1)});
                }
            });
        };
        
        $scope.listarMTBT = function(index){
            $http.get("../rest/iieh/at_inci_detailMTBT?id=-" + $scope.records[$scope.lstIndex]["NUMEROINTERRUPCION"]).then(function(response) {
                $scope.detail = response.data;
                for (var i = 0; i < $scope.detail.length; i++) {
                    var key = $scope.detail[i]["CKEY"];
                    var value = $scope.detail[i]["CVALUE"];
                    if (key == "NUMCOMUNAS") {
                        $scope.numCoumnas = parseInt(value);
                    } else if (key == "NUMCLIENTE") {
                        $scope.numClientes = parseInt(value);
                    } else if (key == "NUMALIMENTADORES") {
                        $scope.numAlimentadores = parseInt(value);
                    } else if (key == "TOTCOMUNAS") {
                        $scope.totComunas = parseInt(value);
                    } else if (key == "TOTCLIENTE") {
                        $scope.totClientes = parseInt(value);
                    } else if (key == "TOTALIMENTADORES") {
                        $scope.totAlimentadores = parseInt(value);
                    } else if (key == "LASTFECHATERMINOINTERRUPCION") {
                        $scope.LASTFECHATERMINOINTERRUPCION = value;
                    } else if (key == "DESCRIPCION"){ 
                        $scope.DESCRIPCION = value;
                    }
                }
                
                $scope.perCoumnas = 100 * $scope.numCoumnas / $scope.totComunas;
                $scope.perCoumnas = Math.round10($scope.perCoumnas, -2);
                
                $scope.perClientes = 100 * $scope.numClientes / $scope.totClientes;
                $scope.perClientes = Math.round10($scope.perClientes, -2);
                
                $scope.perAlimentadores = 100 * $scope.numAlimentadores / $scope.totAlimentadores;
                $scope.perAlimentadores = Math.round10($scope.perAlimentadores, -2);
            });
            $http.get("../rest/iieh/at_inci_comunas?id=-" + $scope.records[$scope.lstIndex]["NUMEROINTERRUPCION"]).then(function(response) {
                $scope.arrComunas = [];
                for (var i = 0; i < response.data.length; i++) {
                    $scope.arrComunas.push({"nom": response.data[i]["ICOM_NOMBRE"], "sel": (response.data[i]["EVAL"] == 1)});
                }
            });
        };
    
	$scope.lstSimular = function() {
            $scope.lstIndex = -1;
            var tipoSeleccionado = $scope.selectedTipoIncidencia.id;
            var empresaSeleccionada = typeof $scope.selectedEmpresa != 'undefined' ?  $scope.selectedEmpresa.id : "0";
            $location.path("/at_simular").search({t: tipoSeleccionado, e:empresaSeleccionada});
	};
	$scope.lstAgregar = function() {
            $scope.lstIndex = -1;
             var tipoSeleccionado = $scope.selectedTipoIncidencia.id;
            var empresaSeleccionada = typeof $scope.selectedEmpresa != 'undefined' ?  $scope.selectedEmpresa.id : "0";
            $location.path("/at_crear").search({t: tipoSeleccionado, e:empresaSeleccionada});
	};
	$scope.lstVer = function() {
            if ($scope.lstIndex < 0)
                    return;
            $location.path("/at_ver/" + $scope.records[$scope.lstIndex]["NUMEROINTERRUPCION"]).search({t: null, e:null});
	};
	$scope.lstEditar = function() {
            if ($scope.lstIndex < 0)
                    return;
            $location.path("/at_actualizar/" + $scope.records[$scope.lstIndex]["NUMEROINTERRUPCION"]).search({t: null, e:null});
	};
        
 	 $scope.incidenciasSec = function() {
            try {
             if (confirm('Se realizará el envio de información a la SEC. ¿Desea Confirmar? ')) {
                              
                $http.get("../rest/iieh/incidenciasSec" ).then(function(response) {
                if(response === null){alert('Error en el envio de la informacion a SEC');}
		else
		{alert('Envio Realizado Correctamente');}
                
            }); 
            
            }else{
            return;            
            } 
        } catch (e) {
            alert(e);
        }

                      		
	};

        $scope.limpiarVariables = function(){
            $scope.lstIndex = -1;
            $scope.detalle = 'hidden';
            
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
        };
	$scope.btnsi = function(){
		document.getElementById('mod-body').innerHTML  = "<div id='fotocargando' style='width:100%;text-align: center;'><img src='../img/cargando.gif'></br>Realizando envio...</div>";
document.getElementById('mod-footer').innerHTML  = "";
	     $http.get("../rest/iieh/incidenciasSec" ).then(function(response) {
                if(response === null)
		{
			document.getElementById('mod-body').innerHTML  ='Error en el envio de la informacion a SEC';
		}
		else
		{
			var tab = "Envio Realizado Correctamente </br></br>El detalle de clientes afectados es el siguiente:</br> ";
			tab = tab +	"<center><table border='3'>";
			tab = tab +	"<tr >";
			tab = tab +	"<th style='width:100px;text-align:left'>Empresa</th>";
			tab = tab +	"<th style='width:150px;text-align:center'>Clientes Afectados</th>";
			tab = tab +	"</tr>";
			tab = tab +	"<tr>";
			tab = tab +	"		<td >Enel Dist</td>";
			tab = tab +	"		<td id='Eneldist' style='text-align:right'>0</td>";								
			tab = tab +	"</tr>";
			tab = tab +	"<tr>";
			tab = tab +	"		<td >Colina</td>";
			tab = tab +	"		<td id='Colina' style='text-align:right'>0</td>";								
			tab = tab +	"</tr>";
			tab = tab +	"<tr>";
			tab = tab +	"		<td >Luz Andes</td>";
			tab = tab +	"		<td id='Luzandes' style='text-align:right'>0</td>"	;							
			tab = tab +	"</tr>";				
			tab = tab +	"</table></center>";
			document.getElementById('mod-body').innerHTML = tab;				
			var i =0; 
			for(i=0;i<response.data.length;i++)
			{
				if(response.data[i].EMPRESA == "ENEL_DIST" ){document.getElementById('Eneldist').innerHTML=response.data[i].CLIENTESAFECTADOS;}
				if(response.data[i].EMPRESA == "COLINA" ){document.getElementById('Colina').innerHTML=response.data[i].CLIENTESAFECTADOS;}
				if(response.data[i].EMPRESA == "LUZ_ANDES" ){document.getElementById('Luzandes').innerHTML=response.data[i].CLIENTESAFECTADOS;}
			}
			
		}
		document.getElementById('mod-footer').innerHTML  = "<button class='btn btn-danger'data-dismiss='modal'onclick='location.reload()'>Cerrar</button>";
             	
            });

	};		

}