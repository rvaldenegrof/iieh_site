function detalle_mensaje_fnc($rootScope, $scope, $routeParams, $http) {
	$http.get("../rest/iieh/mensaje?id=" + $routeParams.ICAB_ID).then(
			function(response) {
				$scope.header = response.data;
			});
	$http.get("../rest/iieh/detalle_mensaje?id=" + $routeParams.ICAB_ID).then(
			function(response) {
				$scope.records = response.data;
			});
        $scope.exportarExcel = function(){
            $("#expTabla").table2excel({
                        // exclude CSS class
                        exclude: ".noExl",
                        name: "Excel Document Name",
                        filename: "DetalleMensaje"
                    }); 
        };

        $scope.exportarCSV = function(){
            $("#expTabla").tableToCSV();
        };
}