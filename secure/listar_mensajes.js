function listar_mensajes_fnc($rootScope, $scope, $routeParams, $http) {
	$rootScope.link_vermsg = "active";
	$rootScope.link_addmsg = "";
	$rootScope.link_verat = "";
	$rootScope.link_agrmsg = "";
        $rootScope.link_valinci = "";
        $rootScope.link_repcorte = "";
        
        $scope.filteredTodos = [];
        $scope.currentPage = 1;
        $scope.numPerPage = 10;
        $scope.maxSize = 5;
        
        $http.get("../rest/iieh/mensajes").then(function(response) {
		$scope.records = response.data;
                $scope.$watch('currentPage + numPerPage', function() {
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                    , end = begin + $scope.numPerPage;

                    $scope.filteredTodos = $scope.records.slice(begin, end);
                });
	});
        
        
        
	$http.get("../rest/iieh/empresas").then(function(response) {
		$scope.empresas = response.data;
	});

	
	
	$scope.b_empresa = -1;
	$scope.b_usuario = "";
	$scope.b_fecha_desde = "";
	$scope.b_fecha_hasta = "";

	$scope.buscar = function() {
		var url = "../rest/iieh/mensajes";
		var params = [];
		var index = 0;
		if ($scope.b_empresa > -1)
			params[index++] = "idEmpresa=" + $scope.b_empresa;
		if ($scope.b_usuario.trim() != "")
			params[index++] = "usuario=" + $scope.b_usuario;
		if ($scope.b_fecha_desde.trim() != "")
			params[index++] = "fechaDesde=" + $scope.b_fecha_desde;
		if ($scope.b_fecha_hasta.trim() != "")
			params[index++] = "fechaHasta=" + $scope.b_fecha_hasta;
		if (index > 0)
			url += "?" + params.join("&");
		$http.get(url).then(function(response) {
			$scope.records = response.data;
		});
	};
}