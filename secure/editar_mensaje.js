function editar_mensaje_fnc($rootScope, $scope, $routeParams, $http) {
    $rootScope.link_vermsg = "";
    $rootScope.link_addmsg = "";
    $rootScope.link_verat = "";
    $rootScope.link_agrmsg = "";
    $rootScope.link_edtmsg = "active";
    
    $http.get("../rest/iieh/listar_mensajes_editar").then(function(response) {
        $scope.encabezado_mensajes = response.data;
    });
    

    $scope.verDetalle = function(msj) {
        
        $http.get("../rest/iieh/detalle_mensaje?id=" + msj.ICAB_ID).then(function(response) {
            $scope.detalle_mensajes = response.data;
        });
    };
}



