function validar_incidencias_fnc($rootScope, $scope, $routeParams, $http, $timeout, $location) {
    
    if($rootScope.permisoValidador === 2 || $rootScope.permisoEsAdmin === 1){
        $scope.abrirModal = function(grupo){
            $scope.grupoCerrar = grupo;
            $scope.interrupcionCerrar = $scope.lista[grupo].NUMERO_INTERRUPCION.toString();
            
            var strArr = $scope.calcularFechaTermino(grupo);
            $scope.fechaCierre = strArr[1];
            $scope.tipoCierre = strArr[0];
            
            $("#myModal").modal();
        };

        $rootScope.link_vermsg = "";
        $rootScope.link_addmsg = "";
        $rootScope.link_verat = "";
        $rootScope.link_agrmsg = "";
        $rootScope.link_edtmsg = "";
        $rootScope.link_valinci = "active";
        $rootScope.link_repcorte = "";
        
        $scope.hiddenGroup = 0;
        
        $http.get("../rest/iieh/listar_mensajes_cerrar").then(function(response) {
            $scope.lista = response.data;
        });
        
        $scope.aceptarCierre = function(){
            var grupo = $scope.grupoCerrar;
            $scope.interrupcionCerrar = $scope.lista[grupo].NUMERO_INTERRUPCION.toString();
            var alimentador = $scope.lista[grupo].ALIMENTADOR.toString();
            
            //        var interrupcion = grupo.substring(grupo.length - 11, grupo.length);
            //        var alimentador = grupo.substring(0, grupo.length - 11);
            var payload = {"alimentador": alimentador, "interrupcion" : $scope.interrupcionCerrar, "usucierre" : $scope.username,
                "tipoCierre": $scope.tipoCierre, "fechaCierre":$scope.fechaCierre};
            
            $http.post("../rest/iieh/cerrar_mensaje", payload).then(function() {
                $http.get("../rest/iieh/listar_mensajes_cerrar").then(function(response) {
                    $scope.lista = response.data;
                });
            });
        };
        
        $scope.calcularFechaTermino = function(indice){
            var resultado = [];
            var inicio = $scope.lista[indice].HORA_INTERRUPCION.toString(); //"2017-06-07 16:24:06";
            var sysdate = new Date(Date.now()).toLocaleString();
            
            inicio = inicio.substring(0, 13).concat(":00:00");
            var fechaHoraSplt = sysdate.split(" ");
            var fechaSplt = fechaHoraSplt[0].split("-");
            var mes = fechaSplt[1];
            if(mes<10){
                mes='0'+mes;
            } 
            var dia = fechaSplt[2];
            if(dia<10){
                dia='0'+dia;
            } 
            var sysdate = fechaSplt[0].concat('-', mes, '-', dia, ' ',fechaHoraSplt[1].substring(0,2), ':00:00');
            
            var sysdate = new Date(sysdate);
            var interrupcion = new Date(inicio);
            
            
            var secs = (sysdate - interrupcion) / 1000;
            var hours = secs / 3600;
            
            var strDate = "";
            var tipoCierre = 0;
            if(hours >= 1){
                
                if(new Date().getMinutes() < 10){
                    //CERRAR EN RANDOM
                    var sysCierre = sysdate;
                    sysCierre.setTime(new Date());
                    if(sysCierre.getHours() === 0){
                        sysCierre.setDate(sysCierre.getDate() - 1);
                        sysCierre.setHours(23);
                    }else{
                        sysCierre.setHours(sysCierre.getHours() - 1);
                    }
                    var random = Math.floor(Math.random() * 298) + 1 ;
                    var minutes = 55 + (random % 3600) / 60;
                    var seconds = random % 60;
                    
                    sysCierre.setMinutes(minutes);
                    sysCierre.setSeconds(seconds);
                    
                    var hh = sysCierre.getHours();
                    if(hh<10)
                        hh='0'+hh;
                    var mi = sysCierre.getMinutes();
                    if(mi<10)
                        mi='0'+mi;
                    var ss = sysCierre.getSeconds();
                    if(ss<10)
                        ss='0'+ss;
                    
                    strDate = sysCierre.toISOString().substring(0,10).concat(' ' , hh, ":" , mi , ":", ss);
                    
                    tipoCierre = 1;
                    resultado.push(tipoCierre, strDate);
                }else{
                    //CERRAR EN SYSDATE.
                    var today = new Date();
                    var hh = today.getHours();
                    if(hh<10)
                        hh='0'+hh;
                    var mi = today.getMinutes();
                    if(mi<10)
                        mi='0'+mi;
                    var ss = today.getSeconds();
                    if(ss<10)
                        ss='0'+ss;
                    
                    strDate = today.toISOString().substring(0,10).concat(' ' , hh, ":" , mi , ":", ss);
                    tipoCierre = 1;
                    resultado.push(tipoCierre, strDate);
                }
            } else{
                //NO ENVIAR
                var today = new Date();
                var hh = today.getHours();
                if(hh<10)
                    hh='0'+hh;
                var mi = today.getMinutes();
                if(mi<10)
                    mi='0'+mi;
                var ss = today.getSeconds();
                if(ss<10)
                    ss='0'+ss;
                
                strDate = today.toISOString().substring(0,10).concat(' ' , hh, ":" , mi , ":", ss);
                tipoCierre = 2;
                resultado.push(tipoCierre, strDate);
            }     
            return resultado;
        };
        
        $scope.getClass = function (idx, grupo){ 
            
            var curentClass = "filaGrupo2";
            var curentGroup = 0;
            
            for(var i = 0; i < $scope.lista.length; ++i){
                if(i === idx){
                    if(grupo !== curentGroup){
                        if(curentClass === "filaGrupo1"){
                            return false;
                        }else{
                            return true;
                        }
                    }else{
                        if(curentClass === "filaGrupo1"){
                            return true;
                        }else{
                            return false;
                        }
                    }  
                }else{
                    if($scope.lista[i].GRUPO !== curentGroup){
                        curentGroup = $scope.lista[i].GRUPO;
                        if(curentClass === "filaGrupo1"){
                            curentClass = "filaGrupo2";
                        }else{
                            curentClass = "filaGrupo1";
                        }
                    }
                }
            }
        };
        
        $scope.isHiddenGroup = function (param){ 
            if(param !== $scope.hiddenGroup){
                $scope.hiddenGroup = param;
                return false;
            }
            return true;
        };
        
        $scope.contarCantGrupo = function(param){
            var count = 0;
            for(var i = 0; i < $scope.lista.length; ++i){
                if($scope.lista[i].GRUPO === param)
                    count++;
            }
            return count;
        };
    }
    else{
        $location.path("/index");
    }
    
    
    
}
