function mantenedor_rpt_fnc($rootScope, $scope, $routeParams, $http) {
/******
ZONA DE INICIALIZACION DE VARIABLES GLOBALES
*******/
var response;
var delete_list = [];
var carga_masiva = [];
var kind = 0;
var ajax_saved_settings;
var table;
var download_restrict = 0;
var restric_download = 0;
var static_heads = ["LINEA" , "CTO" , "SUBESTACION" , "BARRA" , "SDAC" , "CE" , "BF" , "ALIMENTADOR" , "COMUNA", "ALIM_ID"];
var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
var result_catcher = {success:0 , errors:0};

(function($) {
	$.fn.inputFilter = function(inputFilter) {
	  return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
		if (inputFilter(this.value)) {
		  this.oldValue = this.value;
		  this.oldSelectionStart = this.selectionStart;
		  this.oldSelectionEnd = this.selectionEnd;
		} else if (this.hasOwnProperty("oldValue")) {
		  this.value = this.oldValue;
		  this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
		} else {
		  this.value = "";
		}
	  });
	};
  }(jQuery));
	$(document).ready(function(){
		/*******
		AQUI DECLARAMOS LOS MODALES A USAR
		*******/
		$("#izi_modal").iziModal({
			overlayClose: false,
			overlayColor: 'rgba(0, 0, 0, 0.6)',
			transitionIn:'fadeInRight',
			transitionOut:'fadeOutRight',
			onOpened: function (){
				$(".solo_numeros").inputFilter(function(value) {
					return /^\d*$/.test(value);
				});
			},
			onClosing: function () {
				kind = 0;
				$("#form_multifuncion table input").each(function(index , val){
					$(val).val("");
				});
			}
		});
		$("#izi_modal_mass_upload").iziModal({
            overlayClose: false,
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            transitionIn:'fadeInRight',
            transitionOut:'fadeOutRight',
            onOpened:function(){
                $("#upload_file").off("change").change(function(){
					console.log("antes");
                    handleFileSelect();
                })
            },
            onClosing: function () {
                clearMassUpload();
            }
        });
		/*******
		CONTROLES EXTERNOS A LA TABLA, INDEPENDIENTE QUE ESTOS AFECTEN O NO A LA TABLA
		*******/
		$.ajax({
            url:"../rest/iieh/autocompleteAlimentadores",
            success:function(data){
                aliementadores = data;
            }
        });
		$("#nuevo").click(function(){
			kind = 1;
			$('#modal_title').text("Crear nuevo RPT");
			$('#izi_modal').iziModal('open');
		});
		$("#mass_recharge").click(function(){
			$('#izi_modal_mass_upload').iziModal('open');
		});
		$("#export").click(function(){
            var data_export = table
                        .rows()
                        .data();
            var headers = [];
            table.columns().every( function () {        
                headers.push(this.header().innerHTML);
            }); 
            
            //headers.shift();
            headers[headers.length-1] = "ALIM_ID";
            var join = [];
            join.push(headers);
            for(var i= 0 ; i < data_export.length ; i++){
                let length = data_export[i].length;
                data_export[i][length-1] = !isNaN($(data_export[i][length-1]).data("alim_id")) ? $(data_export[i][length-1]).data("alim_id") : data_export[i][length-1];
                join.push(data_export[i]);
                
            };
            let csvContent = "data:text/csv;charset=utf-8," + join.map(e => e.join(";")).join("\n");
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            var f = new Date();
            link.setAttribute("download", "Lista RPT "+padLeft(f.getDate()) + "-"+ meses[f.getMonth()]+ "-" +f.getFullYear()+".csv");
            document.body.appendChild(link); // Required for FF

 

            link.click();
            link.remove();
        });
		$("#downloadIt").click(function(e){
			if(download_restrict > 0){
				if(download_restrict > 5){
					iziToast.warning({
						displayMode: 'once',
						position:"bottomCenter",
						title:"Advertencia",
						message: ''
					});
				}else{
					iziToast.warning({
						displayMode: 'once',
						position:"bottomCenter",
						title:"Advertencia",
						message: 'Usted ya ha descargado un archivo, revise en su carpeta de descargas.'
					});
				}
				download_restrict++;
				e.preventDefault();
			}else{
				download_restrict++;
			}
		});
        $(".aceptar").click(function(){
			let ajax_url = kind == 1 ? "../rest/iieh/crearRPT":"../rest/iieh/editarRPT";
			if(kind == 1){
				if(validateForm()){
					/* con este mandas al backend*/
					let obj = $("#form_multifuncion").serialize().replace("&ALIM_ID=", "");
					/* ojo, cuando hagas el ajax, la respuesta sera un id, ese es el alim_id  */
					let obj2 = orderObjetByKeys(objectifyForm($("#form_multifuncion").serializeArray()));
					console.log(obj2);
					$.ajax({
						url: ajax_url,
						dataType: "json",
						headers: { 
							'Accept': 'application/json',
							'Content-Type': 'application/json' 
						},
						//data: {obj: JSON.stringify(attrToLowers(obj))},
						data: obj,
						beforeSend:function(){
							$("#mantenedor_processing").fadeIn("fast");
						},
						success:function(data){
							//response = $.parseJSON(data);
							//return false;
							//let unique = [...new Set(response.map(item => item.SUBESTACION))];
							//console.log(unique);
							
							obj.ALIM_ID = data;
							obj2.ALIM_ID = data;
							table.row.add( extractElementData(obj2) ).draw( false );
							response.push(obj2);
							$('#izi_modal').iziModal('close');
								iziToast.success({
								position:"bottomCenter",
								message: 'Se a ingresado exitósamente!'
							})
						},
							complete:function(){
								$("#mantenedor_processing").fadeOut("fast");
							}
					});
				}
			}else if(kind == 2){
				let id = $("#form_multifuncion input[name=ALIM_ID]").val();
				let current = JSON.stringify(orderObjetByKeys(response.filter(function(x){ return x.ALIM_ID == id })[0]));
				let update = JSON.stringify(orderObjetByKeys(objectifyForm($("#form_multifuncion").serializeArray())));
				let forTrack =  '<span class="glyphicon glyphicon-pencil editar" data-alim_id="' +id +'" aria-hidden="true" style="font-size:20px;padding:0px;margin-right:10px;"></span>   '+
                                '<span class="glyphicon glyphicon-trash borrar" data-alim_id="' +id +'" aria-hidden="true"style="font-size:20px;padding:0px;margin-left:10px;"></span>'
				if(current == update){
					iziToast.warning({
						position:"bottomCenter",
						title:"Advertencia",
						message: 'No se encontraron diferencia.'
					});
				}else{
					let obj = $("#form_multifuncion").serialize();
					$.ajax({
						url: ajax_url,
						data: obj,
						beforeSend:function(){
							$("#mantenedor_processing").fadeIn("fast");
						},
						success:function(data){
							//response = $.parseJSON(data);				
							//let unique = [...new Set(response.map(item => item.SUBESTACION))];
							//console.log(unique);
							updateTable($.parseJSON(update) , forTrack , id);
							$('#izi_modal').iziModal('close');
							iziToast.success({
							displayMode: 'once',
							position:"bottomCenter",
							message: 'El registro N° '+id+' ha sido modificado con exito!'
					})
						},
						complete:function(){
							$("#mantenedor_processing").fadeOut("fast");
						}
					});

				}
			}
        });
		$(".clear_mass").click(function(){
			clearMassUpload();
		});
		$(".mass_carga").click(function(){
			iziToast.warning({
				title: 'Advertencia',
				displayMode: 'once',
				layout: 2,
				position:"bottomCenter",
				overlay: true,
				timeout:false,
				message: "Esta seguro de realizar esta carga por un total de <b>"+numDecimals(carga_masiva.length)+"</b>?",
				buttons: [
					['<button>Cargar</button>', function (instance, toast) {
						instance.hide({
							transitionOut: 'fadeOutUp',
						}, toast, 'buttonName2');
						applyCargaMasiva();
					}, true],
					['<button>Cancelar</button>', function (instance, toast) {
						instance.hide({
							transitionOut: 'fadeOutUp',
						}, toast, 'buttonName');
					}]
				],
				onClosing:function(){
					
				}
			});
		});
		$("#delete").on("click" , function(){
			if(delete_list.length > 0){
				let msg = delete_list.length == 1 ? 'Esta seguro de eliminar el siguiente RPT ID N° <b>'+delete_list[0]+'</b>??' : 'Esta seguro de eliminar los siguientes <b>'+delete_list.length+'</b> RPTs??';
				iziToast.warning({
					title: 'Advertencia',
					displayMode: 'once',
					layout: 2,
					position:"bottomCenter",
					overlay: true,
					timeout:false,
					message: msg,
					buttons: [
						['<button>Eliminar</button>', function (instance, toast) {
							instance.hide({
								transitionOut: 'fadeOutUp',
							}, toast, 'buttonName2');
							delete_list.forEach(x=>{
								table
									.rows( function ( idx, data, node ) {
										let element = $(data[0]);
										return element.data("alim_id") == x;
									} )
									.remove()
									.draw();
							})
							$("#delete").fadeOut("fast");
							delete_list = [];
						}, true],
						['<button>Cancelar</button>', function (instance, toast) {
							instance.hide({
								transitionOut: 'fadeOutUp',
							}, toast, 'buttonName');
						}]
					],
					onClosing:function(){
						
					}
				});
			}else{
				iziToast.error({
					displayMode: 'once',
					title: 'Error',
					position:'bottomCenter',
					message: 'Debe seleccionar al menos 1 RPT',
				});
			}
		});
		/*******
		NUESTRO CORE, LA TABLA :D
		*******/
		$(".dataTables_processing").load('../img/loader.svg');
		table = $('#mantenedor').DataTable( {
 			"processing": true,
			"language": {
				"url": "../language/lang_es.json"
			},
			initComplete: function () {
				$(".dataTables_processing").load('../img/loader.svg');
				$.ajax({
					url:"../rest/iieh/listarRPT",
					//type:"post",
					//data:"tipo=listar",
					beforeSend:function(){
						$("#mantenedor_processing").fadeIn("fast");
					},
					success:function(data){
						response = data;//$.parseJSON(data);
                        //let unique = [...new Set(response.map(item => item.SUBESTACION))];
                        //console.log(unique);
						response.forEach(element => {
							table.row.add( extractElementData(element) ).draw( false );
						});
					},
					complete:function(){
						$("#mantenedor_processing").fadeOut("fast");
					}
				});
			},
			"columnDefs": [
				{ className: "txt_left", "targets": [1, 3, 4, 5, 6] },
				{ className: "txt_center", "targets": [ /*0 ,*/ 9] },
				{ className: "txt_right", "targets": [ 0, 2, 7, 8 ] }
			],
			"drawCallback":function(){
				/*******
				CONTROLES QUE AFECTAN A LOS ROWS, DEBEN SER AQUI O LAS SIGUIENTES PAGINAS NO TOMARAN EL EVENTO
				*******/
				$(".editar").off("click").on("click" , function(){
					kind = 2;
					let id = $(this).data("alim_id");
					let obj = response.filter(function(x){ return x.ALIM_ID == id })[0];
					var keyNames = Object.keys(obj);
					keyNames.forEach(function(value , index){
						$("input[name="+value+"]").val(obj[value]);
					})
						
					$('#modal_title').text("Editar RPT N° "+id);
					$('#izi_modal').iziModal('open');
				});
				$(".borrar").off("click").on("click" , function(){
					let id = $(this).data("alim_id");
					let row = $(this).parent().parent();
					row.addClass("highlander");
					iziToast.warning({
						title: 'Advertencia',
						displayMode: 'once',
						layout: 2,
						position:"bottomCenter",
						overlay: true,
						timeout:false,
						message: 'Esta seguro de eliminar el <b>RPT id N° '+id+"</b>?",
						buttons: [
							['<button>Eliminar</button>', function (instance, toast) {
								$.ajax({
									url: "../rest/iieh/eliminarRPT",
									data: "ID_ALIMENTADOR="+id,
									beforeSend:function(){
										$("#mantenedor_processing").fadeIn("fast");
									},
									success:function(data){
										var j =response.map(x=> { return parseInt(x.ALIM_ID) });
										var index = j.indexOf(parseInt(id));
										response.splice(index, 1);
										table.row(row).remove().draw();
										$('#izi_modal').iziModal('close');
											iziToast.success({
											position:"bottomCenter",
											message: 'Se ha'+id+' eliminado exitósamente!'
										});
									},
									complete:function(){
										$("#mantenedor_processing").fadeOut("fast");
									}
								});
								instance.hide({
									transitionOut: 'fadeOutUp',
								}, toast, 'buttonName2');
							}, true],
							['<button>Cancelar</button>', function (instance, toast) {
								instance.hide({
									transitionOut: 'fadeOutUp',
								}, toast, 'buttonName');
							}]
						],
						onClosing:function(){
							$(".highlander").removeClass("highlander");
						}
					});
				});
                $(".select").off("click").on("click" , function(){
					let id = $(this).data("alim_id");
					if($(this).is(":checked")){
						delete_list.push(id);
					}else{
						let index = delete_list.indexOf(id);
						if (index > -1) {
							delete_list.splice(index, 1);
						}
					}
					if(delete_list.length > 0)
						$("#delete").fadeIn("fast");
					else
						$("#delete").fadeOut("fast");
				});
			}
		});
	});
	/*******
	ZONA DE FUNCIONES GENERALES
	*******/
	function extractElementData(element){
		return [
			//'<input type="checkbox" class="select" data-alim_id="'+element.ALIM_ID+'"/>',
			element.LINEA,
			element.CTO,
			element.SUBESTACION,
			element.BARRA,
			element.SDAC,
			element.CE,
			element.BF,
			element.ALIMENTADOR,
			element.COMUNA,
			'<span class="glyphicon glyphicon-pencil editar" data-alim_id="' +element.ALIM_ID +'" aria-hidden="true" style="font-size:20px;padding:0px;margin-right:10px;"></span>   '+
			'<span class="glyphicon glyphicon-trash borrar" data-alim_id="' +element.ALIM_ID +'" aria-hidden="true"style="font-size:20px;padding:0px;margin-left:10px;"></span>'
		]
	}
	
	function clearMassUpload(){
		$("#upload_file").val("");
		$("#mass_detail tbody").html("");
		$("#activar_carga_masiva").fadeOut("fast");
	}
	
	function validateForm(){
		let form = $("#form_multifuncion");
		let inputs = form.find("input").not(document.getElementById("comuna")).toArray();
		let isValid = false;
		for(var i = 0 ; i < inputs.length ; i++){
			let input = inputs[i];
			if(inputs[i].name == "ALIM_ID")
				continue;
			if($(input).val() == ""){
				highLightError(input);
				isValid = false;
				break;
			}else{
				isValid = true;
			}
		}
		return isValid;
	}
	function highLightError(elem){
		let target = $(elem);
		target.next().fadeIn("slow");
		target.focus();
		setTimeout(function(){
			target.next().fadeOut("slow");
		} , 2567);
	}
	function objectifyForm(formArray) {
		var returnArray = {};
		for (var i = 0; i < formArray.length; i++){
			returnArray[formArray[i]['name']] = formArray[i]['value'];
		}
		return returnArray;
	}
	function orderObjetByKeys(myObj){
		var keys = [],
			k, i, len , new_arrange = {};

		for (k in myObj) {
			if (myObj.hasOwnProperty(k)) {
				keys.push(k);
			}
		}
		keys.sort();

		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			let new_val = "";
			if(myObj[k])
				if(isNaN(myObj[k]))
					new_val = myObj[k];
				else
					new_val = myObj[k].toString();
		  new_arrange[k] = new_val;
		}
		return new_arrange;
	}
	function updateTable(data , track, id){
        var rowIndex = "";
        table.rows( function ( idx, data, node ) {         
                if(data[8] === track)
                    rowIndex = idx;
                 return false;
             });
        table.row(rowIndex).data(extractElementData(data)).draw();
		var j =response.map(x=> { return parseInt(x.ALIM_ID) });
        var index = j.indexOf(parseInt(id));
        response[index] = data;
	}
	//1
	function handleFileSelect(){           
		console.log("en handle");    
        var regex = /^.+\.(txt|csv)$/;
		if (regex.test($("#upload_file").val().toLowerCase())) {
			if (typeof (FileReader) != "undefined") {
				//
				var reader = new FileReader();
				reader.onload = function (e) {
					var rows = e.target.result.split("\n");
					parseCsvContent(rows);
				}
				reader.readAsText($("#upload_file")[0].files[0]);
			} else {
				iziToast.error({
					displayMode: 'once',
					title: 'Error',
					position:'bottomCenter',
					message: 'Su navegador es algo viejito, cambielo para gozar de esta bondad :)',
				});
				clearMassUpload();
			}
		} else {
			iziToast.error({
				displayMode: 'once',
				title: 'Error',
				position:'bottomCenter',
				message: 'El archivo debe ser un CSV, por favor ingrese un archivo valido.',
			});
			clearMassUpload();
		}
    }
	function parseCsvContent(content){
		var table = "";
        let records = content.length-1;
        let new_records = 0;
        let edit_records = 0;
        let its_ok = true;
        table += "<tr class='all_records'><td>Cantidad Total de registros</td><td>"+numDecimals(records)+"</td><td><span class='glyphicon glyphicon-search lookUp' data-target='0'></td></tr>";
        for (const [index, value] of content.entries()) {
            if(index == 0){
                let result = checkHeads(value);
                if(result != ""){
                    iziToast.error({
                        displayMode: 'once',
                        title: 'Error',
                        position:'bottomCenter',
                        message: 'El archivo no contiene el indice <b>'+result+'</b><br>O no se encuentra en el orden correcto.<br>Verifique su archivo y vuelva a intentarlo.',
                    });
                    clearMassUpload();
                    its_ok = false;
                    break;
                }
            }else{
                let element = value.trim().split(";");
                if(element[element.length-1] == "")
                    new_records++;
                else
                    edit_records++;
                carga_masiva.push(element);
            }
        }
        if(its_ok){
            table += "<tr class='new_recods'><td>Cantidad de registros nuevos</td><td>"+numDecimals(new_records)+"</td><td><span class='glyphicon glyphicon-search lookUp' data-target='1'></td></tr>";
            table += "<tr class='edit_records'><td>Cantidad de registros a modificar</td><td>"+numDecimals(edit_records)+"</td><td><span class='glyphicon glyphicon-search lookUp' data-target='2'></td></tr>";
            $("#mass_detail tbody").html(table);
            $("#activar_carga_masiva").fadeIn("slow");
        }
	}
	function applyCargaMasiva(){
		var current = 1;
		var limit = carga_masiva.length;
		$(".progress").fadeIn("fast")
		$("#recount").fadeIn("fast" , function(){
			$(".progress").attr("aria-valuemax" , limit);
			$("#recount").text(current+"/"+limit);

			var promises = [];
			result_catcher = {success:0 , errors:0};

			sequence(carga_masiva, asyncFunction).then(function () {
				let msg = "De un total de <b>"+carga_masiva.length+"</b> registros enviados<br><b>"+result_catcher.success+"</b> fueron procesados satisfactoriamente<br>mientras que <b>"+result_catcher.errors+"</b> presentaron problemas para cargar";
				clearMassUpload();
				iziToast.success({
					position:"center",
					message: msg
				})
				finishMassCharge();
			});
		});
	}
	function finishMassCharge(){
		clearMassUpload();
		carga_masiva = [];
		let progress = $(".progress-bar");
		progress.css("width" , "0%");
		progress.attr("aria-valuenow" , "0");
		progress.text("0%");
		$('#izi_modal_mass_upload').iziModal('close');
		$(".progress , #recount").fadeOut("fast");
	}
	function checkHeads(row){
		let spliter = row.split(";").map(function(x){ return x.trim().toUpperCase(); });
		let not_in = "";
		let counter = spliter.length;
		for(var i=0 ; i < counter ; i++){
			if(spliter[i] != static_heads[i]){
				not_in = static_heads[i];
				break;
			}
		}
		return not_in;
	}
	function padLeft(n){
		return ("00" + n).slice(-2);
	}
	function numDecimals(value) {
		return value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "." );
	}
	function attrToLowers(obj){
		let attrs = obj.split("&");
        attrs.forEach(function(x , index) {
            let holder = x.split("=");
            attrs[index] = holder[0].toLowerCase()+"="+holder[1];
        });
        let tipo_index = alim_index = -1;
        attrs.forEach(function(x , index) {
            if(x.startsWith("tipo"))
                tipo_index = index;
            if(x.startsWith("alim_id"))
                alim_index = index;
        });
        attrs.splice(tipo_index , 1);
        attrs.splice(alim_index , 1);

		console.log(attrs);
        return attrs.join("&");
	}

	function paramsToObject(val) {
		let entries = val.split("&");
        let object = {};
        entries.forEach(x => {
            let spliter = x.split("=");
            object[spliter[0]] = spliter[1];
        });
        return object;
	}

	function sequence(arr, callback) {
		var i = 0;
		var request = function (item) {
			return callback(item, i, arr.length).then(function () {
				if (i < arr.length - 1)
					return request(arr[++i]);

			});
		}
		return request(arr[i]);
	}
	function asyncFunction(item, index, limit) {

		var url = item[item.length-1] == "" ? "../rest/iieh/crearRPT" : "../rest/iieh/editarRPT";
		
		let objetito = {
			LINEA: item[0],
			CTO: item[1],
			SUBESTACION: item[2],
			BARRA: item[3],
			SDAC: item[4],
			CE: item[5],
			BF: item[6],
			ALIMENTADOR: item[7],
			ALIM_ID: item[8]							
		}
		//console.log(JSON.stringify(objetito));
		return $.ajax({
			url: url,
			data: $.param(objetito)
		})
		.then(function (data) {
			current = index+1;
			var how_much = (current*100/limit).toFixed(1);
			$(".progress-bar").text(how_much+"%");
			$(".progress-bar").attr("aria-valuenow" , how_much);
			$(".progress-bar").css("width" , how_much+"%");
			$("#recount").text(current+"/"+limit);

			if(data > 0){
				objetito.ALIM_ID = data;
				table.row.add( extractElementData(objetito) ).draw( false );
				response.push(objetito);
			}

			if(parseInt(data) > 0)
				result_catcher.success++;
			else
				result_catcher.errors++;
		});
	}
}