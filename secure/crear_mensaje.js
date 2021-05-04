function crear_mensaje_fnc($rootScope, $scope, $routeParams,
		$http) {
	$rootScope.link_vermsg = "";
	$rootScope.link_addmsg = "active";
	$scope.mostarDetalle = "display: none;";
	$scope.lstIndex = -1;
	$scope.data = {
		"empresa" : null,
		"codigoSec" : null,
		"fechaMensaje" : null,
		"codigoProceso" : null,
		"detalles" : []
	};
	$scope.dataEditar = {
		"comuna" : null,
		"numeroInterrupcion" : null,
		"clientesIniciales" : null,
		"clientesAfectados" : null,
		"subEstacion" : null,
		"alimentador" : null,
		"nodoOperado" : null,
		"cuadrillasLivianas" : null,
		"cuadrillasPesadas" : null,
		"fechaInterrupcion" : null,
		"tiempoInterrumpido" : null,
		"tiempoEstimadoReposicion" : null,
		"fechaTerminoInterrupcion" : null
	};
	$http.get("../rest/iieh/empresas").then(function(response) {
		$scope.empresas = response.data;
	});
	$http.get("../rest/iieh/comunas").then(function(response) {
		$scope.comunas = response.data;
	});
	$scope.lstClass = function(index) {
		return ($scope.lstIndex == index) ? "info" : "";
	}
	$scope.lstSel = function(index) {
		if ($scope.mostarDetalle != "")
			if ($scope.lstIndex == -1)
				$scope.lstIndex = index;
			else
				$scope.lstIndex = -1;

	}
	$scope.lstAgregar = function() {
		if ($scope.mostarDetalle == "")
			return;
		$scope.mostarDetalle = "";
		$scope.lstIndex = -1;
	};
	$scope.lstEditar = function() {
		if ($scope.mostarDetalle == "" || $scope.lstIndex < 0)
			return;
		$scope.mostarDetalle = "";
		$scope.dataEditar = jQuery.extend({},
				$scope.data.detalles[$scope.lstIndex]);
	};
	$scope.lstEliminar = function() {
		if ($scope.lstIndex > -1) {
			$scope.data.detalles.splice($scope.lstIndex, 1);
		}
	};

	$scope.detalleCancelar = function() {
		var i, keys = Object.getOwnPropertyNames($scope.dataEditar);
		for (i = 0; i < keys.length; i++) {
			$scope.dataEditar[keys[i]] = null;
		}
		$scope.mostarDetalle = "display: none;";
		$scope.lstIndex = -1;
	};

	$scope.detalleAceptar = function() {
		if ($scope.lstIndex > -1) {
			$scope.data.detalles[$scope.lstIndex] = jQuery.extend({},
					$scope.dataEditar);
		} else {
			$scope.data.detalles[$scope.data.detalles.length] = jQuery.extend(
					{}, $scope.dataEditar);
		}
		var i, keys = Object.getOwnPropertyNames($scope.dataEditar);
		for (i = 0; i < keys.length; i++) {
			$scope.dataEditar[keys[i]] = null;
		}
		$scope.mostarDetalle = "display: none;";
		$scope.lstIndex = -1;
	};
}