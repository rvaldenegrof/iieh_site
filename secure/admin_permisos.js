function admin_permisos_fnc($rootScope, $scope, $routeParams, $http, $timeout, $location) {
    

    
    $rootScope.link_vermsg = "";
    $rootScope.link_addmsg = "";
    $rootScope.link_verat = "";
    $rootScope.link_agrmsg = "";
    $rootScope.link_edtmsg = "";
    $rootScope.link_valinci = "";
    $rootScope.link_repcorte = "";
    
    if($rootScope.permisoEsAdmin === 1 || $rootScope.permisoAdminPermisosUsuario === 2){
        $scope.selectedUsuarioEditar;
        $scope.contraseñaNueva;
        $scope.empresa;
        $scope.selectedRol = [];
        $scope.roles;
        $scope.labelRol = "";
        $scope.usuarioAdmin = $rootScope.permisoEsAdmin === 1 ? true: false;
        $scope.activoVer = true;
        $scope.usuarioAdminNuevoUsuario = true;
        $scope.usuarioAdminFiltro = $rootScope.permisoEsAdmin === 1 ? false: true;
        $scope.disableGuardarVer = true;
        $scope.empresasDuro = [
            {name:'ENEL Dx', id:10},
            {name:'Colina', id:12},
            {name:'Luz Andes', id:15}
        ];
        $scope.empresasDuro.unshift({name:'Seleccione Empresa', id:0});
        
        $scope.selectedEmpresaUsuarioVer = [];
        $scope.empresasUsuario = [
            {name:'ENEL Dx', id:10},
            {name:'Colina', id:12},
            {name:'Luz Andes', id:15},
            {name:'Administradores', id:99}
        ];
        $scope.empresasNuevoUsuario = [
            {name:'ENEL Dx', id:10},
            {name:'Colina', id:12},
            {name:'Luz Andes', id:15}
        ];
        $scope.empresasDuroUsuarioVer = [
            {name:'ENEL Dx', id:10},
            {name:'Colina', id:12},
            {name:'Luz Andes', id:15}
        ];
        $scope.dataRolCrear = [
            { permiso: "Ver Mensajes", valorSL: false, valorLE: null, tipo: 1},
            { permiso: "Edicion Manual AT", valorSL: false, valorLE: false ,  tipo: 3},
            { permiso: "Edicion Manual MT/BT", valorSL: false, valorLE: false , tipo: 3},
            { permiso: "Validar Incidencias", valorSL: null, valorLE: false,  tipo: 2 },
            { permiso: "Reporte Grafico", valorSL: false, valorLE: null,  tipo: 1 },
            { permiso: "Administrador de Permisos y Usuarios", valorSL: null, valorLE: false,  tipo: 2 }
        ];
        $scope.dataRolEditar = [
            { permiso: "Ver Mensajes", valorSL: false, valorLE: null, tipo: 1},
            { permiso: "Edicion Manual AT", valorSL: false, valorLE: false ,  tipo: 3},
            { permiso: "Edicion Manual MT/BT", valorSL: false, valorLE: false , tipo: 3},
            { permiso: "Validar Incidencias", valorSL: null, valorLE: false,  tipo: 2 },
            { permiso: "Reporte Grafico", valorSL: false, valorLE: null,  tipo: 1 },
            { permiso: "Administrador de Permisos y Usuarios", valorSL: null, valorLE: false,  tipo: 2 }
        ];
        
        $scope.gridData = [
            { permiso: "Ver Mensajes", valorSL: false, valorLE: null, tipo: 1},
            { permiso: "Edicion Manual AT", valorSL: true, valorLE: false ,  tipo: 3},
            { permiso: "Edicion Manual MT/BT", valorSL: false, valorLE: true , tipo: 3},
            { permiso: "Validar Incidencias", valorSL: null, valorLE: true,  tipo: 2 },
            { permiso: "Reporte Grafico", valorSL: false, valorLE: null,  tipo: 1 },
            { permiso: "Administrador de Permisos y Usuarios", valorSL: null, valorLE: false,  tipo: 2 }
        ];
        $scope.gridColumns = [
            { field: "permiso", title: "Permiso" },
            { field: "valorSL", title: "Solo Lectura" },
            { field: "valorLE", title: "Lectura/Escritura" },
            { field: "tipo", title: "tipo" }
        ];
        
        for (var i = 0; i < $scope.gridData.length; i++){
            var obj = $scope.gridData[i];
            for (var key in obj){
                var attrName = key;
                var attrValue = obj[key];
            }
        }
        $scope.nextRoute = "";
        $scope.locationChanging = false;
        $scope.$on('$locationChangeStart', function( event, next, current ) {
//            var answer = confirm("¿Desea guardar los cambios antes de salir?");
//            if (answer) {
//                //$scope.guardarCambiosVer();
//                //event.preventDefault();
//            }
            if(!$scope.locationChanging){
                if((typeof $scope.selectedUsuarioEditar != 'undefined' && $scope.selectedUsuarioEditar != null) || (typeof $scope.nuevoPassword != 'undefined' && $scope.nuevoPassword != null)
                        || (typeof $scope.nombreSelected != 'undefined' && $scope.nombreSelected != null )|| (typeof $scope.selectedRol.ROLE != 'undefined' && $scope.selectedRol.ROLE != null)
                        || !$scope.activoVer || (typeof $scope.selectedFiltroEmpresa != 'undefined' && $scope.selectedFiltroEmpresa != null)){
                     event.preventDefault();
                     var strSplit = next.split("#");
                    
                    $scope.nextRoute = strSplit[1];
                    $("#ModalConfirmar").modal({}).draggable();
                }
               
            }

        });
        $scope.aceptarConfirmar = function(){
             $scope.guardarCambiosVerSalir();
             $scope.locationChanging = true;
             $location.path($scope.nextRoute);
        };
        $scope.cancelarConfirmar = function(){
             $scope.locationChanging = true;
             $location.path($scope.nextRoute);
        };
        $scope.cerrarConfirmar = function(){
             $scope.locationChanging = true;
             $location.path($scope.nextRoute);
        };

        
        
        $scope.obtenerUsuarios = function(){
            $http.get("../rest/iieh/lista_usuarios").then(function(response) {
                $scope.usuariosEditar = response.data;
                $scope.disableGuardarVer = true;
            });
        };
        $scope.obtenerUsuariosPorEmpresa = function(){
            $scope.nombreSelected = null;
            $http.get("../rest/iieh/lista_usuarios_x_empresa?id="+$scope.selectedFiltroEmpresa.id).then(function(response) {
                $scope.usuariosEditar = response.data;
                $scope.disableGuardarVer = true;
                $scope.roles =[];
                $scope.empresasDuroUsuarioVer = [
                    {name:'ENEL Dx', id:10},
                    {name:'Colina', id:12},
                    {name:'Luz Andes', id:15}
                ];
                $scope.selectedRol = [];
                $scope.selectedEmpresaUsuarioVer = [];
                
                $scope.gridData = [
                    { permiso: "Ver Mensajes", valorSL: false, valorLE: null, tipo: 1},
                    { permiso: "Edicion Manual AT", valorSL: true, valorLE: false ,  tipo: 3},
                    { permiso: "Edicion Manual MT/BT", valorSL: false, valorLE: true , tipo: 3},
                    { permiso: "Validar Incidencias", valorSL: null, valorLE: true,  tipo: 2 },
                    { permiso: "Reporte Grafico", valorSL: false, valorLE: null,  tipo: 1 },
                    { permiso: "Administrador de Permisos y Usuarios", valorSL: null, valorLE: false,  tipo: 2 }
                ];
                $scope.usuarioAdmin = true;
            });
            
            
        };
        if(!$scope.usuarioAdmin){
            $http.get("../rest/iieh/lista_usuarios_x_empresa?id="+$rootScope.permisoEmpresa).then(function(response) {
                    $scope.usuariosEditar = response.data;
            });
        }

        $scope.obtenerRoles = function(){
            $http.get("../rest/iieh/obtener_roles").then(function(response) {
                $scope.roles = response.data;
                $scope.rolesVer = response.data;
            });
        };
        $scope.obtenerRoles();
        
        $scope.cambiarUsuarioEditar = function(){
            //cargar grilla con permisos para editar
            if(typeof $scope.selectedUsuarioEditar != 'undefined' && $scope.selectedUsuarioEditar !== null){
                $scope.disableGuardarVer = false;
                $http.get("../rest/iieh/obtener_rol?rol=" + $scope.selectedUsuarioEditar.ROLE).then(function(response) {
                    $scope.dataRol = response.data;
                    $scope.nombreSelected = $scope.selectedUsuarioEditar.NOMBRE;
                    
                    $http.get("../rest/iieh/obtener_roles").then(function(response) {
                        $scope.roles = response.data;
                        var elRol= [];
                        elRol = $scope.dataRol;
                        $scope.selectedRol = elRol[0];
                        $scope.activoVer = $scope.selectedUsuarioEditar.ACTIVO === 1 ? true : false;
                        $scope.cambiarRolVer();
                        //                if($scope.dataUsuario[0].EMPRESA === 12){
                        //                    $scope.selectedEmpresa = $scope.empresasDuro[0];
                        //                } else if($scope.dataUsuario[0].EMPRESA === 15){
                        //                    $scope.selectedEmpresa = $scope.empresasDuro[1];
                        //                } 
                        //                else{
                        //                    $scope.selectedEmpresa = null;
                        //                }
                        
//                        $http.get("../rest/iieh/empresa_user?username=" + $scope.selectedUsuarioEditar.USERNAME).then(function(response) {
//                            var userempresa = response.data[0].USEREMPRESA;
//                            var nombre = '';
//                            if(userempresa === 10){
//                                nombre = 'ENEL Dx';
//                                $scope.empresasDuroUsuarioVer = [
//                                    {name:'ENEL Dx', id:10}
//                                ];
//                            }else if(userempresa === 12){
//                                nombre = 'Colina';
//                                $scope.empresasDuroUsuarioVer = [
//                                    {name:'Colina', id:12}
//                                ];
//                            }else if(userempresa === 15){
//                                nombre = 'Luz Andes';
//                                $scope.empresasDuroUsuarioVer = [
//                                    {name:'Luz Andes', id:15}
//                                ];
//                            }
//                            $scope.selectedEmpresaUsuarioVer = {name:nombre, id:userempresa};
//                        });
                    });
                    
                });
            }else{
                $scope.disableGuardarVer = true;
            }
            
        };
        
        $scope.cambiarRolVer = function(){
            //cargar grilla con permisos para editar
            $http.get("../rest/iieh/permisos_x_rol?rol=" + $scope.selectedRol.ROLE).then(function(response) {
                $scope.permisoUsuarioVer = response.data[0];
                
                var userempresa = response.data[0].EMPRESA;
                var nombre = '';
                if(userempresa === 10){
                    nombre = 'ENEL Dx';
                    $scope.empresasDuroUsuarioVer = [
                        {name:'ENEL Dx', id:10}
                    ];
                }else if(userempresa === 12){
                    nombre = 'Colina';
                    $scope.empresasDuroUsuarioVer = [
                        {name:'Colina', id:12}
                    ];
                }else if(userempresa === 15){
                    nombre = 'Luz Andes';
                    $scope.empresasDuroUsuarioVer = [
                        {name:'Luz Andes', id:15}
                    ];
                }
                $scope.selectedEmpresaUsuarioVer = {name:nombre, id:userempresa};
                
                $scope.labelRol = $scope.permisoUsuarioVer["ES_ADMIN"] === 1 ? "(ADMINISTRADOR)" : "";
//                        ($scope.permisoUsuarioVer["EMPRESA"] === 12 ? "(COLINA)" : $scope.permisoUsuarioVer["EMPRESA"] === 10 ? "(ENEL Dx.)" : $scope.permisoUsuarioVer["EMPRESA"] === 15 ? "(LUZ ANDES)" : "");
                $scope.usuarioAdmin = $scope.permisoUsuarioVer["ES_ADMIN"] === 1 ? true : false;
                $scope.gridData[0]["valorSL"] = $scope.permisoUsuarioVer["MENSAJES"] === 1 ? true : false;
                $scope.gridData[1]["valorSL"] = $scope.permisoUsuarioVer["PERMISOAT"] === 1 ? true : false;
                $scope.gridData[1]["valorLE"] = $scope.permisoUsuarioVer["PERMISOAT"] === 2 ? true : false;       
                $scope.gridData[2]["valorSL"] = $scope.permisoUsuarioVer["PERMISOMT"] === 1 ? true : false;
                $scope.gridData[2]["valorLE"] = $scope.permisoUsuarioVer["PERMISOMT"] === 2 ? true : false;
                $scope.gridData[3]["valorLE"] = $scope.permisoUsuarioVer["VALIDADOR"]  === 2 ? true : false;
                $scope.gridData[4]["valorSL"] = $scope.permisoUsuarioVer["REPORTEGRAFICO"]  === 1 ? true : false;
                $scope.gridData[5]["valorLE"] = $scope.permisoUsuarioVer["ADMINPERMUSU"]  === 2 ? true : false;
                
            });
        };
        
        $scope.cambiarRolNuevoUsuario = function(){
            //cargar grilla con permisos para editar
            $http.get("../rest/iieh/permisos_x_rol?rol=" + $scope.selectedRolNuevoUsuario.ROLE).then(function(response) {
                $scope.permisoUsuarioVer = response.data[0];
                
                var rolempresa = response.data[0].EMPRESA;
                if(rolempresa === 10){
                    $scope.empresasNuevoUsuario = [
                        {name:'ENEL Dx', id:10}
                    ];
                    $scope.selectedEmpresaUsuarioNuevo = $scope.empresasNuevoUsuario[0];
                }else if(rolempresa === 12){
                    $scope.empresasNuevoUsuario = [
                        {name:'Colina', id:12}
                    ];
                    $scope.selectedEmpresaUsuarioNuevo = $scope.empresasNuevoUsuario[0];
                }else if(rolempresa === 15){
                    $scope.empresasNuevoUsuario = [
                        {name:'Luz Andes', id:15}
                    ];
                    $scope.selectedEmpresaUsuarioNuevo = $scope.empresasNuevoUsuario[0];
                }
//                $scope.labelRol = $scope.permisoUsuarioVer["ES_ADMIN"] === 1 ? "(ADMINISTRADOR)" : 
//                        ($scope.permisoUsuarioVer["EMPRESA"] === 12 ? "(COLINA)" : $scope.permisoUsuarioVer["EMPRESA"] === 10 ? "(ENEL Dx.)" : $scope.permisoUsuarioVer["EMPRESA"] === 15 ? "(LUZ ANDES)" : "");
                $scope.usuarioAdminNuevoUsuario = $scope.permisoUsuarioVer["ES_ADMIN"] === 1 ? true : false;
         
                
            });
        };
        
        $scope.guardarCambiosVerSalir = function(){
            
            if(typeof $scope.selectedUsuarioEditar != 'undefined'){
                pass = typeof $scope.nuevoPassword == 'undefined' || $scope.nuevoPassword === '' ? $scope.selectedUsuarioEditar.PASSWORD : $scope.nuevoPassword;
                
                if(pass != '' && $scope.nombreSelected != null && $scope.nombreSelected !== '' && 
                        $scope.selectedRol.ROLE != '' && $scope.selectedUsuarioEditar.USERNAME != '' &&
                        typeof $scope.selectedEmpresaUsuarioVer.id != 'undefined'){
                    var userempresa = $scope.selectedEmpresaUsuarioVer.id;
                    if($scope.usuarioAdmin)
                        userempresa = 0;
                    if(!$scope.usuarioAdmin && (userempresa === 0 || typeof userempresa === 'undefined')){
                        $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                        $("#ModalAdvertencia").modal({}).draggable();
                    }else{
                        payload = {"nombre" : $scope.nombreSelected,"usuario":$scope.selectedUsuarioEditar.USERNAME,
                            "password":pass, "rol":$scope.selectedRol.ROLE,
                            "activo": $scope.activoVer, "userempresa" : userempresa};

                        $http.post("../rest/iieh/editar_usuario", payload).then(function(response) {
                            if(response.data[0]["resultado"] === 0){
                                $scope.msgCuerpo = "No se pudieron guardar los cambios.";
                                $("#ModalError").modal({}).draggable();
                            }else{
//                                $scope.msgCuerpo = "Cambios ingresados exitosamente.";
//                                $("#ModalExito").modal({}).draggable();

                                var seleccionado = $scope.selectedUsuarioEditar.USERNAME;
                                $http.get("../rest/iieh/lista_usuarios").then(function(response) {
                                    $scope.usuariosEditar = response.data;
                                        for (var i = 0; i < $scope.usuariosEditar.length; i++){
                                            if ($scope.usuariosEditar[i].USERNAME === seleccionado){
                                                $scope.selectedUsuarioEditar = $scope.usuariosEditar[i];
                                            }
                                        }
                                });
                            }
                        },function(reject){
                            $scope.msgCuerpo = "No se pudieron guardar los cambios.";
                            $("#ModalError").modal({}).draggable();
                        });
                    }
                    
                }else{
                    $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                    $("#ModalAdvertencia").modal({}).draggable();
                }
            }else{
                $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                $("#ModalAdvertencia").modal({}).draggable();
            }
            
            
        };
        $scope.guardarCambiosVer = function(){
            
            if(typeof $scope.selectedUsuarioEditar != 'undefined'){
                pass = typeof $scope.nuevoPassword == 'undefined' || $scope.nuevoPassword === '' ? $scope.selectedUsuarioEditar.PASSWORD : $scope.nuevoPassword;
                
                if(pass != '' && $scope.nombreSelected != null && $scope.nombreSelected !== '' && 
                        $scope.selectedRol.ROLE != '' && $scope.selectedUsuarioEditar.USERNAME != '' &&
                        typeof $scope.selectedEmpresaUsuarioVer.id != 'undefined'){
                    var userempresa = $scope.selectedEmpresaUsuarioVer.id;
                    if($scope.usuarioAdmin)
                        userempresa = 0;
                    if(!$scope.usuarioAdmin && (userempresa === 0 || typeof userempresa === 'undefined')){
                        $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                        $("#ModalAdvertencia").modal({}).draggable();
                    }else{
                        payload = {"nombre" : $scope.nombreSelected,"usuario":$scope.selectedUsuarioEditar.USERNAME,
                            "password":pass, "rol":$scope.selectedRol.ROLE,
                            "activo": $scope.activoVer, "userempresa" : userempresa};
                        
                        $http.post("../rest/iieh/editar_usuario", payload).then(function(response) {
                            if(response.data[0]["resultado"] === 0){
                                $scope.msgCuerpo = "No se pudieron guardar los cambios.";
                                $("#ModalError").modal({}).draggable();
                            }else{
                                $scope.msgCuerpo = "Cambios ingresados exitosamente.";
                                $("#ModalExito").modal({}).draggable();
                                var seleccionado = $scope.selectedUsuarioEditar.USERNAME;
                                var selectedempresaFiltro;
                                if($scope.usuarioAdmin)
                                    selectedempresaFiltro = $scope.selectedFiltroEmpresa.id;
                                
                                
                                if(!$scope.activoVer){
                                    $scope.selectedUsuarioEditar = null;
                                    $scope.nombreSelected = null;
                                    $scope.nuevoPassword = null;
                                    $scope.selectedRol.ROLE = null;
                                    $scope.selectedFiltroEmpresa = null;
                                    $scope.activoVer = true;
                                    $scope.labelRol = '';
                                    if($scope.usuarioAdmin){
                                        $scope.usuariosEditar = null;
                                        $scope.selectedUsuarioEditar = null
                                    }
                                        
                                }else{
                                    if($scope.usuarioAdmin){
                                        $http.get("../rest/iieh/lista_usuarios_x_empresa?id="+selectedempresaFiltro).then(function(response) {
                                            $scope.usuariosEditar = response.data;
                                            for (var i = 0; i < $scope.usuariosEditar.length; i++){
                                                if ($scope.usuariosEditar[i].USERNAME === seleccionado){
                                                    $scope.selectedUsuarioEditar = $scope.usuariosEditar[i];
                                                }
                                            }
                                        });
                                    } else{
                                        $http.get("../rest/iieh/lista_usuarios").then(function(response) {
                                            $scope.usuariosEditar = response.data;
                                            for (var i = 0; i < $scope.usuariosEditar.length; i++){
                                                if ($scope.usuariosEditar[i].USERNAME === seleccionado){
                                                    $scope.selectedUsuarioEditar = $scope.usuariosEditar[i];
                                                }
                                            }
                                        });
                                    }
                                }
                                
                            }
                        },function(reject){
                            $scope.msgCuerpo = "No se pudieron guardar los cambios.";
                            $("#ModalError").modal({}).draggable();
                        });
                    }
                    
                }else{
                    $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                    $("#ModalAdvertencia").modal({}).draggable();
                }
            }else{
                $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                $("#ModalAdvertencia").modal({}).draggable();
            }
            
            
        };
        $scope.abrirModalCambiarPassword = function(){
            
            $scope.nuevoPassword = "";
            $scope.nuevoPasswordRepetir = "";
            $("#ModalCambiarPassword").modal({}).draggable();
            
            elTulRepetir = $('#inRepetir').tooltip();
            elTulRepetir.unbind('mouseenter mouseleave focusin');
            elTulNueva = $('#inNueva').tooltip();
            elTulNueva.unbind('mouseenter mouseleave focusin');
            
        };
        $scope.abrirModalNuevoRol = function(){
            $scope.rolAdminCrear = false;
            $scope.idRolCrear = "";
            $scope.nombreRolCrear = "";
            $scope.dataRolCrear = [
                { permiso: "Ver Mensajes", valorSL: false, valorLE: null, tipo: 1},
                { permiso: "Edicion Manual AT", valorSL: false, valorLE: false ,  tipo: 3},
                { permiso: "Edicion Manual MT/BT", valorSL: false, valorLE: false , tipo: 3},
                { permiso: "Validar Incidencias", valorSL: null, valorLE: false,  tipo: 2 },
                { permiso: "Reporte Grafico", valorSL: false, valorLE: null,  tipo: 1 },
                { permiso: "Administrador de Permisos y Usuarios", valorSL: null, valorLE: false,  tipo: 2 }
            ];
        
            $http.get("../rest/iieh/obtener_roles").then(function(response) {
                $scope.rolesVer = response.data;
                $("#ModalNuevoRol").modal({}).draggable();  
            });
        };
        $scope.abrirModalNuevoUsuario = function(){
            $scope.nuevoUsuarioNombre = "";
            $scope.nuevoUsuario = "";
            $scope.nuevoPasswordNuevoUsuario = "";
            $scope.nuevoPasswordRepetirNuevoUsuario = "";
            $scope.selectedRolNuevoUsuario = "";
            $scope.selectedEmpresaUsuarioNuevo = [];
            $scope.usuarioAdminNuevoUsuario = true;
            $http.get("../rest/iieh/obtener_roles").then(function(response) {
                $scope.rolesUsuarioNuevo = response.data;
                $("#ModalNuevoUsuario").modal({}).draggable();
                elTulRepetir = $('#inRepetirNuevoUsuario').tooltip();
                elTulRepetir.unbind('mouseenter mouseleave focusin');
                elTulNueva = $('#inNuevaNuevoUsuario').tooltip();
                elTulNueva.unbind('mouseenter mouseleave focusin');
            });
        };
        
        $scope.abrirModalEditarRol = function(){
            $scope.rolAdminEditar = false;
            $scope.idRolEditar = $scope.selectedRol;
            $scope.nombreRolEditar = $scope.selectedRol.APELLIDO;
            $scope.selectedEmpresaRolEditar = null;
            $scope.empresasDuroEditarRol  = [];
            
            $scope.dataRolEditar = [
                { permiso: "Ver Mensajes", valorSL: false, valorLE: null, tipo: 1},
                { permiso: "Edicion Manual AT", valorSL: false, valorLE: false ,  tipo: 3},
                { permiso: "Edicion Manual MT/BT", valorSL: false, valorLE: false , tipo: 3},
                { permiso: "Validar Incidencias", valorSL: null, valorLE: false,  tipo: 2 },
                { permiso: "Reporte Grafico", valorSL: false, valorLE: null,  tipo: 1 },
                { permiso: "Administrador de Permisos y Usuarios", valorSL: null, valorLE: false,  tipo: 2 }
            ];
           
           
            $scope.rolAdminEditar = $scope.selectedRol.ES_ADMIN === 1 ? true : false;
            $scope.cambiarRolEditar();
            $("#ModalEditarRol").modal({}).draggable();  
        };
        
        $scope.cambiarRolEditar = function(){
            $http.get("../rest/iieh/obtener_rol?rol=" + $scope.idRolEditar.ROLE).then(function(response) {
                $scope.rolEditar = response.data;
                $scope.nombreRolEditar = $scope.rolEditar[0].APELLIDO;
                $scope.rolAdminEditar = $scope.rolEditar[0].ES_ADMIN === 1 ? true : false;
                
                if($scope.rolEditar[0].EMPRESA === 10){
                    $scope.empresasDuroEditarRol = [
                        {name:'ENEL Dx', id:10}
                    ];
                }else if($scope.rolEditar[0].EMPRESA === 12){
                    $scope.empresasDuroEditarRol = [
                        {name:'Colina', id:12}
                    ];
                }else if($scope.rolEditar[0].EMPRESA === 15){
                    $scope.empresasDuroEditarRol = [
                        {name:'Luz Andes', id:15}
                    ];
                }
                $scope.selectedEmpresaRolEditar = $scope.empresasDuroEditarRol[0];
                
//                if($scope.rolEditar[0].EMPRESA === 12){
//                    $scope.selectedEmpresaRolEditar = $scope.empresasDuro[2];
//                }else if($scope.rolEditar[0].EMPRESA === 15){
//                    $scope.selectedEmpresaRolEditar = $scope.empresasDuro[3];
//                }else if($scope.rolEditar[0].EMPRESA === 10){
//                    $scope.selectedEmpresaRolEditar = $scope.empresasDuro[1];
//                }
//                
                $http.get("../rest/iieh/permisos_x_rol?rol=" + $scope.idRolEditar.ROLE).then(function(response) {
                    $scope.permisoRolEditar = response.data[0];
                    $scope.dataRolEditar[0]["valorSL"] = $scope.permisoRolEditar["MENSAJES"] === 1 ? true : false;
                    $scope.dataRolEditar[1]["valorSL"] = $scope.permisoRolEditar["PERMISOAT"] === 1 ? true : false;
                    $scope.dataRolEditar[1]["valorLE"] = $scope.permisoRolEditar["PERMISOAT"] === 2 ? true : false;       
                    $scope.dataRolEditar[2]["valorSL"] = $scope.permisoRolEditar["PERMISOMT"] === 1 ? true : false;
                    $scope.dataRolEditar[2]["valorLE"] = $scope.permisoRolEditar["PERMISOMT"] === 2 ? true : false;
                    $scope.dataRolEditar[3]["valorLE"] = $scope.permisoRolEditar["VALIDADOR"]  === 2 ? true : false;
                    $scope.dataRolEditar[4]["valorSL"] = $scope.permisoRolEditar["REPORTEGRAFICO"]  === 1 ? true : false;
                    $scope.dataRolEditar[5]["valorLE"] = $scope.permisoRolEditar["ADMINPERMUSU"]  === 2 ? true : false;
                    
                });
            });
        };
        
        $scope.limpiarEditarRol = function (){
            $scope.rolAdminEditar = false;
            $scope.idRolEditar = $scope.selectedRol;
            $scope.nombreRolEditar = $scope.selectedRol.APELLIDO;
            $scope.selectedEmpresaRolEditar = null;
            $scope.empresasDuroEditarRol  = [];
            
            $scope.dataRolEditar = [
                { permiso: "Ver Mensajes", valorSL: false, valorLE: null, tipo: 1},
                { permiso: "Edicion Manual AT", valorSL: false, valorLE: false ,  tipo: 3},
                { permiso: "Edicion Manual MT/BT", valorSL: false, valorLE: false , tipo: 3},
                { permiso: "Validar Incidencias", valorSL: null, valorLE: false,  tipo: 2 },
                { permiso: "Reporte Grafico", valorSL: false, valorLE: null,  tipo: 1 },
                { permiso: "Administrador de Permisos y Usuarios", valorSL: null, valorLE: false,  tipo: 2 }
            ];
            
            
            $scope.rolAdminEditar = $scope.selectedRol.ES_ADMIN === 1 ? true : false;
        };
        $scope.tulOnFocusNueva = false;
        $scope.verificaNuevoPasswordMayus = function(){
            
            if (CapsLock.isOn()){
                if($scope.tulOnNueva !== true || $scope.tulOnFocusNueva === false){
                    $scope.tulOnNueva = true;
                    $('#inNueva').tooltip("show");
                }
            }else{
                $scope.tulOnNueva = false;
                $('#inNueva').tooltip("hide");
            }
            $scope.tulOnFocusNueva = true;
        };
        $scope.verificaRepetirPasswordMayus = function(){
            if (CapsLock.isOn()){
                if($scope.tulOnRepetir !== true || $scope.tulOnFocusNueva === true){
                    $scope.tulOnRepetir = true;
                    $('#inRepetir').tooltip("show");
                }
            }else{
                $scope.tulOnRepetir = false;
                $('#inRepetir').tooltip("hide");
            }
            $scope.tulOnFocusNueva = false;
        };
        
        $scope.tulOnFocusNuevaNuevoUsuario = false;
        $scope.verificaNuevoPasswordMayusNuevoUsuario = function(){
            
            if (CapsLock.isOn()){
                if($scope.tulOnNueva !== true || $scope.tulOnFocusNuevaNuevoUsuario === false){
                    $scope.tulOnNueva = true;
                    $('#inNuevaNuevoUsuario').tooltip("show");
                }
            }else{
                $scope.tulOnNueva = false;
                $('#inNuevaNuevoUsuario').tooltip("hide");
            }
            $scope.tulOnFocusNuevaNuevoUsuario = true;
        };
        $scope.verificaRepetirPasswordMayusNuevoUsuario = function(){
            if (CapsLock.isOn()){
                if($scope.tulOnRepetir !== true || $scope.tulOnFocusNuevaNuevoUsuario === true){
                    $scope.tulOnRepetir = true;
                    $('#inRepetirNuevoUsuario').tooltip("show");
                }
            }else{
                $scope.tulOnRepetir = false;
                $('#inRepetirNuevoUsuario').tooltip("hide");
            }
            $scope.tulOnFocusNuevaNuevoUsuario = false;
        };
        
        $scope.guardarNuevoUsuario = function(){
            $http.get("../rest/iieh/permisos_x_rol?rol=" + $scope.selectedRolNuevoUsuario.ROLE).then(function(response) {
                $scope.permisoUsuarioVer = response.data[0];
                $scope.usuarioAdminNuevoUsuario = $scope.permisoUsuarioVer["ES_ADMIN"] === 1 ? true : false;
         
                var activoUsuario = $scope.activoNuevoUsuario ? 1 : 0;
                var userEmpresa;
                if(!$scope.usuarioAdminNuevoUsuario){
                    userEmpresa = $scope.selectedEmpresaUsuarioNuevo.id;
                }else{
                    userEmpresa = 0;
                }
                if(typeof $scope.selectedEmpresaUsuarioNuevo.id === 'undefined' && !$scope.usuarioAdminNuevoUsuario){
                    $scope.msgCuerpo = "Debe ingresar todos los datos.";
                    $("#ModalAdvertencia").modal({}).draggable();
                    
                }else{
                    payload = {"nombre" : $scope.nuevoUsuarioNombre,"usuario":$scope.nuevoUsuario,
                    "password":$scope.nuevoPasswordNuevoUsuario, "rol":$scope.selectedRolNuevoUsuario.ROLE, "activo":activoUsuario,
                    "userEmpresa":userEmpresa, "esAdmin": $scope.usuarioAdminNuevoUsuario};

                    $http.put("../rest/iieh/nuevo_usuario", payload).then(function(response) {
                        if(response.data[0]["resultado"] === 0){
                            $scope.msgCuerpo = "No se pudo ingresar el usuario.";
                            $("#ModalError").modal({}).draggable();
                        }else{
                            $scope.msgCuerpo = "Usuario ingresado exitosamente.";
                            $("#ModalExito").modal({}).draggable();
                            
                            $scope.roles =[];
                            $scope.empresasDuroUsuarioVer = [
                                {name:'ENEL Dx', id:10},
                                {name:'Colina', id:12},
                                {name:'Luz Andes', id:15}
                            ];
                            $scope.selectedRol = [];
                            $scope.selectedEmpresaUsuarioVer = [];
                            
                            $scope.gridData = [
                                { permiso: "Ver Mensajes", valorSL: false, valorLE: null, tipo: 1},
                                { permiso: "Edicion Manual AT", valorSL: true, valorLE: false ,  tipo: 3},
                                { permiso: "Edicion Manual MT/BT", valorSL: false, valorLE: true , tipo: 3},
                                { permiso: "Validar Incidencias", valorSL: null, valorLE: true,  tipo: 2 },
                                { permiso: "Reporte Grafico", valorSL: false, valorLE: null,  tipo: 1 },
                                { permiso: "Administrador de Permisos y Usuarios", valorSL: null, valorLE: false,  tipo: 2 }
                            ];
                            $scope.usuarioAdmin = true;
                            if($rootScope.permisoEsAdmin === 1){
                                $scope.obtenerUsuariosPorEmpresa();
                            }else{
                                $scope.obtenerUsuarios();
                            }
                        }
                    },function(reject){
                        $scope.msgCuerpo = "No se pudo ingresar el usuario. [reject]";
                        $("#ModalError").modal({}).draggable();
                    });
                }
            });
        };
        
        $scope.updateContrasena = function(){
            
            payload = {"usuario":$scope.selectedUsuarioEditar.USERNAME,
                "password":$scope.nuevoPassword};
            
            $http.post("../rest/iieh/editar_usuario", payload).then(function(response) {
                if(response.data[0]["resultado"] === 0){
                    $scope.msgCuerpo = "No se pudo editar el usuario.";
                    $("#ModalError").modal({}).draggable();
                }else{
                    $scope.msgCuerpo = "Usuario editado exitosamente.";
                    $("#ModalExito").modal({}).draggable();
                }
            },function(reject){
                $scope.msgCuerpo = "No se pudo editar el usuario.";
                $("#ModalError").modal({}).draggable();
            });
        };
        
        $scope.guardarNuevoRol = function(){
            
            if($scope.nombreRolCrear !== ""){
                if($scope.rolAdminCrear === false && $scope.selectedEmpresaRolCrear.id === 0){
                    $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                    $("#ModalAdvertencia").modal({}).draggable();
                } else{
                    verMensajes = $scope.dataRolCrear[0]["valorSL"] ? 1 : 0;
                    edicionAT = $scope.dataRolCrear[1]["valorSL"] === false ? ($scope.dataRolCrear[1]["valorLE"] ? 2 : 0) : 1;
                    edicionMTBT = $scope.dataRolCrear[2]["valorSL"] === false ? ($scope.dataRolCrear[2]["valorLE"] ? 2 : 0) : 1;
                    validarIncidencias = $scope.dataRolCrear[3]["valorLE"] ? 2 : 0;
                    reporteGrafico = $scope.dataRolCrear[4]["valorSL"] ? 1 : 0;
                    adminpermusu = $scope.dataRolCrear[5]["valorLE"] ? 2 : 0;
                    
                    $http.get("../rest/iieh/existe_perfil?nombreRol=" + $scope.nombreRolCrear.trim()).then(function(response) {
                         if(response.data[0]["RESULTADO"] === 0){
                             payload = {"idRol":$scope.idRolCrear,
                                "nombreRol":$scope.nombreRolCrear.trim(), "esAdmin": $scope.rolAdminCrear,
                                "empresa": $scope.selectedEmpresaRolCrear.id, "verMensajes": verMensajes,
                                "edicionAT": edicionAT,"edicionMTBT": edicionMTBT,"validarIncidencias": validarIncidencias,
                                "reporteGrafico": reporteGrafico, "adminpermusu": adminpermusu};

                            $http.put("../rest/iieh/rol_crear", payload).then(function(response) {
                                if(response.data[0]["resultado"] === 0){
                                    $scope.msgCuerpo = "No se pudo crear el perfil.";
                                    $("#ModalError").modal({}).draggable();
                                }else{
                                    $scope.msgCuerpo = "El nuevo perfil ha sido creado exitosamente.";
                                    $("#ModalExito").modal({}).draggable();
                                    //recargar combos
                                   
                                    $scope.rolAdminCrear = false;
                                    $scope.idRolCrear = "";
                                    $scope.nombreRolCrear = "";
                                    $scope.obtenerRoles();
                                }
                            },function(reject){
                                $scope.msgCuerpo = "No se pudo crear el perfil.";
                                $("#ModalError").modal({}).draggable();
                            });
                         } else{
                                $scope.msgCuerpo = "Este perfil ya existe, favor cree uno nuevo.";
                                $("#ModalError").modal({}).draggable();
                         }
                    });
                }
            }else{
                $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                $("#ModalAdvertencia").modal({}).draggable();
            }
            
            
            
        };
        
        $scope.guardarEditarRol = function(){
            
            if($scope.nombreRolEditar !== ""){

//                payload = {"nombre" : $scope.nuevoUsuarioNombre,"usuario":$scope.nuevoUsuario,
//                    "password":$scope.nuevoPasswordNuevoUsuario, "rol":$scope.selectedRolNuevoUsuario.ROLE, "activo":activoUsuario,
//                    "userEmpresa":userEmpresa, "esAdmin": $scope.usuarioAdminNuevoUsuario};

                verMensajes = $scope.dataRolEditar[0]["valorSL"] ? 1 : 0;
                edicionAT = $scope.dataRolEditar[1]["valorSL"] === false ? ($scope.dataRolEditar[1]["valorLE"] ? 2 : 0) : 1;
                edicionMTBT = $scope.dataRolEditar[2]["valorSL"] === false ? ($scope.dataRolEditar[2]["valorLE"] ? 2 : 0) : 1;
                validarIncidencias = $scope.dataRolEditar[3]["valorLE"] ? 2 : 0;
                reporteGrafico = $scope.dataRolEditar[4]["valorSL"] ? 1 : 0;
                adminpermusu = $scope.dataRolEditar[5]["valorLE"] ? 2 : 0;
                    
                payload = {"idRol":$scope.idRolEditar.ROLE,
                    "nombreRol":$scope.nombreRolEditar, "esAdmin": $scope.rolAdminEditar,
                    "verMensajes": verMensajes,
                   
                    "edicionAT": edicionAT,"edicionMTBT": edicionMTBT,"validarIncidencias": validarIncidencias,
                    "reporteGrafico": reporteGrafico, "adminpermusu": adminpermusu};
                
                $http.post("../rest/iieh/rol_editar", payload).then(function(response) {
                    if(response.data[0]["resultado"] === 0){
                        $scope.msgCuerpo = "No se pudo crear el perfil.";
                        $("#ModalError").modal({}).draggable();
                    }else{
                        $scope.msgCuerpo = "El perfil se editó exitosamente.";
                        $("#ModalExito").modal({}).draggable();
                        //$scope.obtenerRoles();
                        $scope.limpiarEditarRol();
                        $scope.cambiarUsuarioEditar();
                    }
                },function(reject){
                    $scope.msgCuerpo = "No se pudo crear el perfil.";
                    $("#ModalError").modal({}).draggable();
                });
            }else{
                $scope.msgCuerpo = "Debe completar todos los campos antes de guardar.";
                $("#ModalAdvertencia").modal({}).draggable();
            }
            
        };
        
        $scope.cambiaValorSLLERolCrear = function(idx, col){
            if(col === 1){
                if($scope.dataRolCrear[idx]["valorSL"] === true){
                    $scope.dataRolCrear[idx]["valorLE"] = false;
                }
            }else{
                if($scope.dataRolCrear[idx]["valorLE"] === true){
                    $scope.dataRolCrear[idx]["valorSL"] = false;
                }
            }
        };
        
        $scope.cambiaValorSLLERolEditar = function(idx, col){
            if(col === 1){
                if($scope.dataRolEditar[idx]["valorSL"] === true){
                    $scope.dataRolEditar[idx]["valorLE"] = false;
                }
            }else{
                if($scope.dataRolEditar[idx]["valorLE"] === true){
                    $scope.dataRolEditar[idx]["valorSL"] = false;
                }
            }
        };
        
        $scope.validaIngresoUsuario = function(){
            
            $http.get("../rest/iieh/existe_usuario?username=" + (""+$scope.nuevoUsuarioNombre)).then(function(response) {
                existe = parseInt(response.data[0]["EXISTE"]) > 0 ? true : false;
                activo = parseInt(response.data[0]["ACTIVO"]) === 1 ? true : false;
                if(existe && !activo){ // rehabilitar
                    //modal
                    $scope.msgCuerpo = "El usuario que va a ingresar ya se encuentra inactivo en el sistema. ¿Desea activarlo con los datos ingresados?";
                    $("#ModalReingreso").modal({}).draggable();
                    
                } else if (existe && activo){
                    //no se puede
                    $scope.msgCuerpo = "No se pudo ingresar. El usuario ya existe y se encuentra activo.";
                    $("#ModalError").modal({}).draggable();
                } else{
                    //ingreso normal
                    $scope.guardarNuevoUsuario();
                }
            });
            
            
        };
        
        $scope.ingresaUsuarioRehabilitado = function(){
            userEmpresa = 0;
            usuariomodifica = $rootScope.username;
            activoUsuario = $scope.activoNuevoUsuario ? 1 : 0;
            if(typeof $scope.selectedEmpresaUsuarioNuevo !== 'undefined')
                userEmpresa = $scope.selectedEmpresaUsuarioNuevo.id; 
            
            payload = {"username":$scope.nuevoUsuario, "activo":activoUsuario,
                "password":$scope.nuevoPasswordNuevoUsuario,
                "role":$scope.selectedRolNuevoUsuario.ROLE,"userempresa":userEmpresa,
                "nombre" : $scope.nuevoUsuarioNombre, "usuariomodifica":usuariomodifica};
            
            $http.put("../rest/iieh/reingresa_usuario", payload).then(function(response) {
                if(response.data[0]["resultado"] === 1){
                    //exito
                    $scope.msgCuerpo = "El usuario se habilitó exitosamente.";
                    $("#ModalExito").modal({}).draggable();
                    $scope.limpiarEditarRol();
                    $scope.cambiarUsuarioEditar();
                }else{
                    //error
                    $scope.msgCuerpo = "No se pudo habilitar al usuario.";
                    $("#ModalError").modal({}).draggable();
                }
            },function(reject){
                $scope.msgCuerpo = "No se pudo habilitar al usuario. [reject]";
                $("#ModalError").modal({}).draggable();
            });
        };
        
        $scope.cancelaUsuarioRehabilitado = function(){
            $("#ModalNuevoUsuario").modal('hide');
        };
        
        $scope.validaCorreos = function (){
            var splCorreos = $scope.textoCorreos.split(',');
            var reggie = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            var cantidad = splCorreos.length;
            var idx = 1;
            
            var BreakException = {};
            var result = true;
            
            try {
                splCorreos.forEach(function(entry) {
                    
                    var elCorreo = entry.replace(/(\r\n|\n|\r)/gm,"");
                    if(elCorreo === '' && cantidad === idx){
                        result = true;
                    } else{
                        
                        var correoFinal = reggie.exec(elCorreo);
                        if(typeof correoFinal === 'undefined' || correoFinal === null){
                            throw BreakException;
                        }
                        idx = idx + 1;
                    }
                });
            } catch (e) {
                result = false;
            }

           
            return result;
        };
        
        $scope.validaDias = function(){
            return $scope.isNumber($scope.diasAntiguedad);
        };
        $scope.isNumber = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        
        $scope.cargaConfigProcesoSec = function(){
            $http.get("../rest/iieh/correos_proceso").then(function(response) {
                $scope.dataCorreos = response.data;
                var stringCorreos = "";
                $scope.dataCorreos.forEach(function(entry) {
                    stringCorreos+= entry["CORREO"]+",\n";
                });
                $scope.textoCorreos = stringCorreos;
                $http.get("../rest/iieh/value_parametro?id_parametro=1").then(function(response){
                    $scope.diasAntiguedad = response.data[0]["VALOR"];
                });
            });
        };
        $scope.cargaConfigProcesoSec();
        
        
        $scope.guardarCorreosDias = function(){
            //var correosAntiguos = "";
            var correosNuevos = [];
            var correosEliminar = [];
            var jsonCorreos = []; //correos del usuario
            
            var txtCorreos = $scope.textoCorreos.toString().replace(/\r?\n/g, "");
            var splCorreos = txtCorreos.split(",");
            
            var reggie = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            splCorreos.forEach(function(arrElem) {
                var found = false;
                $scope.dataCorreos.forEach(function(entry) {
                    if(entry.CORREO === arrElem){
                        jsonCorreos.push({"CORREO":arrElem, "ID_CORREO":entry["ID_CORREO"]});
                        found = true;
                    }
                });
                if(!found && reggie.exec(arrElem)){
                    correosNuevos.push({"ID_CORREO":0, "CORREO":arrElem});
                }
            });
            
            $scope.dataCorreos.forEach(function(entryAntiguos) {
                var found = false;
                jsonCorreos.forEach(function(entryActuales) {
                    if(entryActuales["CORREO"] === entryAntiguos["CORREO"]){
                        //jsonCorreos.push({"CORREO":entryActuales["CORREO"], "VALOR":entryActuales["VALOR"]});
                        found = true;
                    }
                });
                if(!found){
                    correosEliminar.push({"ID_CORREO":entryAntiguos["ID_CORREO"], "CORREO":entryAntiguos["CORREO"]});
                }
            });
            
            if(correosEliminar.length > 0){
                correosEliminar.forEach(function(eliminar) {
                    
                    $http.delete("../rest/iieh/elimina_correos?idCorreo="+ eliminar["ID_CORREO"]).then(function(response) {
                        
                        if(correosNuevos.length > 0){
                            correosNuevos.forEach(function(agregar) {
                                
                                payload = {"ID_CORREO":0, "CORREO":agregar["CORREO"]};
                                
                                $http.put("../rest/iieh/agrega_correos", payload).then(function(response) {
                                    $http.put("../rest/iieh/value_parametro?id_parametro=1&valor=" + $scope.diasAntiguedad).then(function(response){
                                        $scope.msgCuerpo = "Cambios realizados correctamente.";
                                        $("#ModalExito").modal({}).draggable();
                                        $scope.cargaConfigProcesoSec();
                                    },function(reject){
                                        $scope.msgCuerpo = "No se pudieron guardar los dias de antigüedad de incidencias. [reject]";
                                        $("#ModalError").modal({}).draggable();
                                    });
                                },function(reject){
                                    $scope.msgCuerpo = "No se pudieron guardar los correos nuevos. [reject]";
                                    $("#ModalError").modal({}).draggable();
                                });
                                
                            });
                            
                        } else{
                            $http.put("../rest/iieh/value_parametro?id_parametro=1&valor=" + $scope.diasAntiguedad).then(function(response){
                                $scope.msgCuerpo = "Cambios realizados correctamente.";
                                $("#ModalExito").modal({}).draggable();
                                $scope.cargaConfigProcesoSec();
                            },function(reject){
                                $scope.msgCuerpo = "No se pudieron guardar los dias de antigüedad de incidencias. [reject]";
                                $("#ModalError").modal({}).draggable();
                            });
                        }
                        
                    },function(reject){
                        $scope.msgCuerpo = "No se pudieron actualizar los correos. [reject]";
                        $("#ModalError").modal({}).draggable();
                    });
                    
                });
            } else{
                if(correosNuevos.length > 0){
                    correosNuevos.forEach(function(agregar) {
                        
                        payload = {"ID_CORREO":0, "CORREO":agregar["CORREO"]};
                        
                        $http.put("../rest/iieh/agrega_correos", payload).then(function(response) {
                            $http.put("../rest/iieh/value_parametro?id_parametro=1&valor=" + $scope.diasAntiguedad).then(function(response){
                                $scope.msgCuerpo = "Cambios realizados correctamente.";
                                $("#ModalExito").modal({}).draggable();
                                $scope.cargaConfigProcesoSec();
                            },function(reject){
                                $scope.msgCuerpo = "No se pudieron guardar los dias de antigüedad de incidencias. [reject]";
                                $("#ModalError").modal({}).draggable();
                            });
                        },function(reject){
                            $scope.msgCuerpo = "No se pudieron guardar los correos nuevos. [reject]";
                            $("#ModalError").modal({}).draggable();
                        });
                        
                    });
                    
                } else{
                    $http.put("../rest/iieh/value_parametro?id_parametro=1&valor=" + $scope.diasAntiguedad).then(function(response){
                        $scope.msgCuerpo = "Cambios realizados correctamente.";
                        $("#ModalExito").modal({}).draggable();
                        $scope.cargaConfigProcesoSec();
                    },function(reject){
                        $scope.msgCuerpo = "No se pudieron guardar los dias de antigüedad de incidencias. [reject]";
                        $("#ModalError").modal({}).draggable();
                    });
                }
            }
            
            
            
    
        };
        
        $scope.guardarDias = function(){
            
            
        };
        
        $scope.guardarDatosSec = function(){
            if(!$scope.validaCorreos()){
                //correos malos, popup
                $scope.msgCuerpo = "Los correos ingresados estan en un formato incorrecto.";
                $("#ModalError").modal({}).draggable();
            }else{
                if(!$scope.validaDias()){
                    //dias malos, popup
                    $scope.msgCuerpo = "Los dias de antigüedad seleccionados son incorrectos.";
                    $("#ModalError").modal({}).draggable();
                }else{
                    $scope.guardarCorreosDias();
                    //$scope.guardarDias();
                    
                }
            }
        };
    }else{
        $location.path("/index");
    }
    
    
}