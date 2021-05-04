function at_ver_fnc($rootScope, $scope, $routeParams, $http, $location) {
	$rootScope.link_vermsg = "";
	$rootScope.link_addmsg = "";
	$rootScope.link_verat = "active";

	$scope.numCoumnasOrg = 0.0;
	$scope.perCoumnasOrg = 0.0;
	$scope.numClientesOrg = 0.0;
	$scope.perClientesOrg = 0.0;
	$scope.numAlimentadoresOrg = 0.0;
	$scope.perAlimentadoresOrg = 0.0;

	$scope.numCoumnas = 0.0;
	$scope.totComunas = 0.0;
	$scope.perCoumnas = 0.0;
	$scope.arrComunas = [];

	$scope.numClientes = 0.0;
	$scope.totClientes = 0.0;
	$scope.perClientes = 0.0;
        $scope.ColumnasATOcultas = true;
	$scope.numAlimentadores = 0.0;
	$scope.totAlimentadores = 0.0;
	$scope.perAlimentadores = 0.0;

	$http.get("../rest/iieh/date").then(function(response) {
		$scope.fechaterminointerrupcion = response.data[0]["CURDATE"].trim();
	});

        $http.get("../rest/iieh/empresa_x_alimentador?numinterrupcion=-" + $routeParams.id).then(function(response) {
            $scope.empresaListar = response.data[0]["EMPRESA"];
            $scope.TipoIncidenciaListar = response.data[0]["TIPOINCIDENCIA"];
            
            if($scope.TipoIncidenciaListar === 1){
                // recalcular totales
                $scope.ColumnasATOcultas = false;
                $http.get("../rest/iieh/at_inci_detail?id=-" + $routeParams.id).then(function(response) {
                    $scope.detail = response.data;
                    for (var i = 0; i < $scope.detail.length; i++) {
                        var key = $scope.detail[i]["CKEY"];
                        var value = $scope.detail[i]["CVALUE"];
                        if (key == "NUMCOMUNAS") {
                            $scope.numCoumnasOrg = parseInt(value);
                        } else if (key == "NUMCLIENTE") {
                            $scope.numClientesOrg = parseInt(value);
                        } else if (key == "NUMALIMENTADORES") {
                            $scope.numAlimentadoresOrg = parseInt(value);
                        } else if (key == "TOTCOMUNAS") {
                            $scope.totComunas = parseInt(value);
                        } else if (key == "TOTCLIENTE") {
                            $scope.totClientes = parseInt(value);
                        } else if (key == "TOTALIMENTADORES") {
                            $scope.totAlimentadores = parseInt(value);
                        } else if (key == "LASTFECHATERMINOINTERRUPCION") {
                            $scope.LASTFECHATERMINOINTERRUPCION = value;
                        } else if (key == "DESCRIPCION") {
                            $scope.DESCRIPCION = value;
                        }
                    }

                    $scope.perCoumnasOrg = 100 * $scope.numCoumnasOrg / $scope.totComunas;
                    $scope.perCoumnasOrg = Math.round10($scope.perCoumnasOrg, -2);
                    $scope.perCoumnas = $scope.perCoumnasOrg;

                    $scope.perClientesOrg = 100 * $scope.numClientesOrg / $scope.totClientes;
                    $scope.perClientesOrg = Math.round10($scope.perClientesOrg, -2);
                    $scope.perClientes = $scope.perClientesOrg;

                    $scope.perAlimentadoresOrg = 100 * $scope.numAlimentadoresOrg / $scope.totAlimentadores;
                    $scope.perAlimentadoresOrg = Math.round10($scope.perAlimentadoresOrg, -2);
                    $scope.perAlimentadores = $scope.perAlimentadoresOrg;
                });
            } else{
                // recalcular totales
                $scope.ColumnasATOcultas = true;
                $http.get("../rest/iieh/at_inci_detailMTBT?id=-" + $routeParams.id).then(function(response) {
                    $scope.detail = response.data;
                    for (var i = 0; i < $scope.detail.length; i++) {
                        var key = $scope.detail[i]["CKEY"];
                        var value = $scope.detail[i]["CVALUE"];
                        if (key == "NUMCOMUNAS") {
                            $scope.numCoumnasOrg = parseInt(value);
                        } else if (key == "NUMCLIENTE") {
                            $scope.numClientesOrg = parseInt(value);
                        } else if (key == "NUMALIMENTADORES") {
                            $scope.numAlimentadoresOrg = parseInt(value);
                        } else if (key == "TOTCOMUNAS") {
                            $scope.totComunas = parseInt(value);
                        } else if (key == "TOTCLIENTE") {
                            $scope.totClientes = parseInt(value);
                        } else if (key == "TOTALIMENTADORES") {
                            $scope.totAlimentadores = parseInt(value);
                        } else if (key == "LASTFECHATERMINOINTERRUPCION") {
                            $scope.LASTFECHATERMINOINTERRUPCION = value;
                        } else if (key == "DESCRIPCION") {
                            $scope.DESCRIPCION = value;
                        }
                    }

                    $scope.perCoumnasOrg = 100 * $scope.numCoumnasOrg / $scope.totComunas;
                    $scope.perCoumnasOrg = Math.round10($scope.perCoumnasOrg, -2);
                    $scope.perCoumnas = $scope.perCoumnasOrg;

                    $scope.perClientesOrg = 100 * $scope.numClientesOrg / $scope.totClientes;
                    $scope.perClientesOrg = Math.round10($scope.perClientesOrg, -2);
                    $scope.perClientes = $scope.perClientesOrg;

                    $scope.perAlimentadoresOrg = 100 * $scope.numAlimentadoresOrg / $scope.totAlimentadores;
                    $scope.perAlimentadoresOrg = Math.round10($scope.perAlimentadoresOrg, -2);
                    $scope.perAlimentadores = $scope.perAlimentadoresOrg;
                });
            }
        }); 


	$http.get("../rest/iieh/at_inci_comunas?id=" + (-$routeParams.id)).then(function(response) {
		$scope.arrComunas = [];
		for (var i = 0; i < response.data.length; i++) {
			$scope.arrComunas.push({
				"nom" : response.data[i]["ICOM_NOMBRE"],
				"sel" : (response.data[i]["EVAL"] == 1)
			});
		}
		$scope.numCoumnas = 0;
		for (var i = 0; i < $scope.totComunas; i++) {
			if ($scope.arrComunas[i]["sel"])
				$scope.numCoumnas++;
		}
		$scope.perCoumnas = 100 * $scope.numCoumnas / $scope.totComunas;
		$scope.perCoumnas = Math.round10($scope.perCoumnas, -2);
	});

	$http.get("../rest/iieh/mensaje_at?id=-" + $routeParams.id).then(function(response) {
		$scope.fechainterrupcion = response.data[0]["FECHAINTERRUPCION"].trim();
	});

	$http.get("../rest/iieh/at_inci_parameter?id=" + (-$routeParams.id)).then(function(response) {
		$scope.atbase = response.data;
		var length = $scope.atbase.length;
		for (var i = 0; i < length; i++) {
			$scope.atbase[i].selected = true;
		}
		$scope.selSTART();
		$scope.recalcularResumen();
	});

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
			if ($scope.atbase[i].selected == true) {
				setComunasSel.add($scope.atbase[i]["ICOM_NOMBRE"]);
				setAlimentadoresSel.add($scope.atbase[i]["ALIMENTADOR"]);
				$scope.numClientes += $scope.atbase[i]["CANT_CLI"];
			}
		}

		$scope.numAlimentadores = setAlimentadoresSel.values().length;
		$scope.perAlimentadores = 100 * $scope.numAlimentadores / $scope.totAlimentadores;
		$scope.perAlimentadores = Math.round10($scope.perAlimentadores, -2);

		$scope.perClientes = 100 * $scope.numClientes / $scope.totClientes;
		$scope.perClientes = Math.round10($scope.perClientes, -2);

		$scope.numCoumnas = 0;
		for (var i = 0; i < $scope.arrComunas.length; i++) {
			if ($scope.arrComunas[i]["sel"] = setComunasSel.contains($scope.arrComunas[i]["nom"]))
				$scope.numCoumnas++;
		}
		$scope.perCoumnas = 100 * $scope.numCoumnas / $scope.totComunas;
		$scope.perCoumnas = Math.round10($scope.perCoumnas, -2);
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
		}
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
		$scope.recalcularResumen();
	}

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
		try {
			var term = str2Date($scope.fechaterminointerrupcion);
			var inter = str2Date($scope.fechainterrupcion);
			if (inter.getTime() < term.getTime()) {
				$http.get("../rest/iieh/date").then(function(response) {
					var ahora = str2Date(response.data[0]["CURDATE"].trim());
					if (term.getTime() < ahora.getTime()) {
						var payload = {
							"id" : -$routeParams.id,
							"fechaterminointerrupcion" : $scope.fechaterminointerrupcion,
							"data" : $scope.atbase
						};
						$http.post('../rest/iieh/mensaje_at', payload).then(function() {
							$location.path("/at_listar");
						}, function() {
							$location.path("/at_listar");
						});
					} else {
//						alert("la fecha/hora es mayor que la actual");
					}
				});
			} else {
//				alert("la fecha/hora es menor a la de creacion");
			}
		} catch (e) {
//			alert("revise las fechas");
			return;
		}
	};

	$scope.cancelar = function() {
		$location.path("/at_listar");
	};

	$scope.cierreRapido = function() {
		try {
			var term = str2Date($scope.fechaterminointerrupcion);
			var inter = str2Date($scope.fechainterrupcion);
			if (inter.getTime() < term.getTime()) {
				$http.get("../rest/iieh/date").then(function(response) {
					var ahora = str2Date(response.data[0]["CURDATE"].trim());
					if (term.getTime() < ahora.getTime()) {
						for (var i = 0; i < $scope.atbase.length; i++) {
							$scope.atbase[i].selected = false;
						}
						var payload = {
							"id" : -$routeParams.id,
							"fechaterminointerrupcion" : $scope.fechaterminointerrupcion,
							"data" : $scope.atbase
						};
						$http.post('../rest/iieh/mensaje_at', payload).then(function() {
							$location.path("/at_listar");
						}, function() {
							$location.path("/at_listar");
						});
					} else {
//						alert("la fecha/hora es mayor que la actual");
					}
				});
			} else {
//				alert("la fecha/hora es menor a la de creacion");
			}
		} catch (e) {
//			alert("revise las fechas");
			return;
		}
	};

}