var app = angular.module('iieh', [ "ngRoute", "ngSanitize", "ui.bootstrap.datetimepicker", "ui.bootstrap", "anguFixedHeaderTable", "ngMaterial" ]);


app.controller('index', index_fnc);
app.controller('iieh', iieh_fnc);
app.controller('at_listar', at_listar_fnc);
app.controller('at_crear', at_crear_fnc);
app.controller('at_simular', at_simular_fnc);
app.controller('at_actualizar', at_actualizar_fnc);
app.controller('at_ver', at_ver_fnc);
app.controller('listar_mensajes', listar_mensajes_fnc);
app.controller('detalle_mensaje', detalle_mensaje_fnc);
app.controller('detalle_envios_mensaje', detalle_envios_mensaje_fnc);
app.controller('crear_mensaje', crear_mensaje_fnc);
//app.controller('agregar_mensaje', agregar_mensaje_fnc);
app.controller('editar_mensaje', editar_mensaje_fnc);
app.controller('validar_incidencias', validar_incidencias_fnc);
app.controller('reporte_cortes', reporte_cortes_fnc);
app.controller('admin_permisos', admin_permisos_fnc);
app.controller('busqueda_incidencias', busqueda_incidencias_fnc);
app.controller('mantenedor_rpt', mantenedor_rpt_fnc);
app.config(iieh_routes_fnc);

function iieh_routes_fnc($routeProvider) {
    
    $routeProvider.when("/", {
        templateUrl : "iieh.html",
        controller : "iieh"
    }).when("/listar_mensajes", {
        templateUrl : "listar_mensajes.html",
        controller : "listar_mensajes"
    }).when("/at_listar", {
        templateUrl : "at_listar.html",
        controller : "at_listar"
    }).when("/at_crear", {
        templateUrl : "at_crear.html",
        controller : "at_crear"
    }).when("/at_simular", {
        templateUrl : "at_simular.html",
        controller : "at_simular"
    }).when("/at_ver/:id", {
        templateUrl : "at_ver.html",
        controller : "at_ver"
    }).when("/at_actualizar/:id", {
        templateUrl : "at_actualizar.html",
        controller : "at_actualizar"
    }).when("/mensajes", {
        templateUrl : "listar_mensajes.html",
        controller : "listar_mensajes"
    }).when("/detalle_mensaje/:ICAB_ID", {
        templateUrl : "detalle_mensaje.html",
        controller : "detalle_mensaje"
    }).when("/detalle_envios_mensaje/:ICAB_ID", {
        templateUrl : "detalle_envios_mensaje.html",
        controller : "detalle_envios_mensaje"
    }).when("/crear_mensaje", {
        templateUrl : "crear_mensaje.html",
        controller : "crear_mensaje"
//    }).when("/agregar_mensaje", {
//        templateUrl : "agregar_mensaje.html",
//        controller : "agregar_mensaje"
    }).when("/editar_mensaje", {
        templateUrl : "editar_mensaje.html",
        controller : "editar_mensaje"
    }).when("/validar_incidencias", {
        templateUrl : "validar_incidencias.html",
        controller : "validar_incidencias"
    }).when("/reporte_cortes", {
        templateUrl : "reporte_cortes.html",
        controller : "reporte_cortes"
    }).when("/admin_permisos", {
        templateUrl : "admin_permisos.html",
        controller : "admin_permisos"
    }).when("/busqueda_incidencias", {
        templateUrl : "busqueda_incidencias.html",
        controller : "busqueda_incidencias"
    }).when("/mantenedor_rpt", {
        templateUrl : "mantenedor_rpt.html",
        controller : "mantenedor_rpt"
    });
}

function index_fnc($rootScope, $scope, $routeParams, $http, $location) {
    $http.get("../rest/iieh/whoami").then(function(response) {
        var mydata = response.data[0];
        $rootScope.username = mydata["USERNAME"];
        $rootScope.role = mydata["ROL"];
        $rootScope.name = mydata["NOMBRE"];
        $rootScope.apellido = mydata["APELLIDO"];
        $rootScope.WHOAMI = $rootScope.name + ", " + $rootScope.apellido;
        $rootScope.permisoEsAdmin = 0;
        $rootScope.permisoReporte = 0;
        $rootScope.permisoMensajes = 0;
        $rootScope.ocultaEdicionManual = 0;
        $rootScope.permisoAdminPermisosUsuario = 0;
        $rootScope.etiqueta_verat = "Incidencias AT";
        $http.get("../rest/iieh/permisos?usuario=" + $rootScope.username).then(function(response) {
            var mydata2 = response.data[0];
            if(typeof mydata2 == 'undefined'){
                location.href = 'logout';
                return;
            }
            if($rootScope.apellido === "Despachador ENEL Dx"){
                $rootScope.etiqueta_verat = "Incidencias AT";
            } else{
                $rootScope.etiqueta_verat = "Edición Manual";
            }
            $rootScope.permisoEsAdmin = mydata2["ES_ADMIN"];
            if($rootScope.permisoEsAdmin === 1){
                $rootScope.permisoValidador = 1;
                $rootScope.permisoEmpresa =1;
                $rootScope.permisoAT = 1;
                $rootScope.permisoMT = 1;
                $rootScope.permisoBT =1;
                $rootScope.permisoReporte = 1;
                $rootScope.permisoMensajes = 1;
                $rootScope.permisoValidador = 1;
                $rootScope.permisoEdicionManual = 1;
                $rootScope.permisoAdminPermisosUsuario = 2;
            } else{
                $rootScope.permisoEmpresa = mydata2["EMPRESA"];
                $rootScope.permisoAT = mydata2["PERMISOAT"];
                $rootScope.permisoMT = mydata2["PERMISOMT"];
                $rootScope.permisoBT = mydata2["PERMISOBT"];
                $rootScope.permisoReporte = mydata2["REPORTEGRAFICO"];
                $rootScope.permisoMensajes = mydata2["MENSAJES"];
                $rootScope.permisoValidador = mydata2["VALIDADOR"];
                $rootScope.permisoAdminPermisosUsuario = mydata2["ADMINPERMUSU"];
                if($rootScope.permisoAT === 0 && $rootScope.permisoMT === 0){
                    $rootScope.permisoEdicionManual = 0;
                }
                
                
            }
            
            
        });
    });
    
    
}

function StringSet() {
    var setObj = {}, val = {};

    this.add = function(str) {
        if (str == null)
            str = "--VACIO--";
        setObj[str] = val;
    };

    this.contains = function(str) {
        return setObj[str] === val;
    };

    this.remove = function(str) {
        delete setObj[str];
    };

    this.values = function() {
        var values = [];
        for ( var i in setObj) {
            if (setObj[i] === val) {
                values.push(i);
            }
        }
        return values;
    };
}
//Conclusión
(function() {
    /**
     * Ajuste decimal de un número.
     *
     * @param {String}  tipo  El tipo de ajuste.
     * @param {Number}  valor El numero.
     * @param {Integer} exp   El exponente (el logaritmo 10 del ajuste base).
     * @returns {Number} El valor ajustado.
     */
    function decimalAdjust(type, value, exp) {
        // Si el exp no está definido o es cero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // Si el valor no es un número o el exp no es un entero...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function(value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function(value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();
function str2Date(dateString){
    //dateString = "9:08:53 31-08-2017";
    var reggie = /(\d{2}):(\d{2}):(\d{2}) (\d{2})-(\d{2})-(\d{4})/;
    var dateArray = reggie.exec(dateString); 
    var dateObject = null;
    
    if(dateArray === null){
        reggie = /(\d{1}):(\d{2}):(\d{2}) (\d{2})-(\d{2})-(\d{4})/;
        dateArray = reggie.exec(dateString); 
    }
    dateObject = new Date(
            (+dateArray[6]),
    (+dateArray[5])-1, // Careful, month starts at 0!
    (+dateArray[4]),
    (+dateArray[1]),
    (+dateArray[2]),
    (+dateArray[3])
            ); 
    return dateObject;
}

