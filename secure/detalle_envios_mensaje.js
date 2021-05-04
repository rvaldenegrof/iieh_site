function detalle_envios_mensaje_fnc($rootScope, $scope, $routeParams, $http) {
	$http.get("../rest/iieh/detalle_envios_mensaje?id=" + $routeParams.ICAB_ID).then(
			function(response) {$scope.records = response.data;});
}