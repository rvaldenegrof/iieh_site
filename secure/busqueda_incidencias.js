function busqueda_incidencias_fnc($rootScope, $scope, $routeParams, $http) {
var delay = 1000;
var limitance_export = 1048000;
var page_info;
var substract_month_default = 3;
var initial_filter;
var start_date;
var end_date;
var ajax_saved_settings;
var table;
	$(document).ready(function(){
		$('#example tfoot th').each( function () {
			var este = $(this);
			var title = $(this).text();
			if(este.hasClass("alim")){
				$(this).html( '<input type="text" style="width:130px;" placeholder="Buscar" />' );
			}else if(este.hasClass("text") && este.hasClass("has_filter")){
				$(this).html( '<input type="text" style="width:100%;" placeholder="Buscar" />' );
			}else if(este.hasClass("date") && este.hasClass("has_filter")){
				$(this).html( '<input type="text" readonly class="range" style="width:131px;" placeholder="Desde" />' );
			}
		} );

		$("#limiter").text(substract_month_default);
		start_date = moment().subtract(substract_month_default, 'months').format('DD/MM/YYYY');
		end_date = moment().format('DD/MM/YYYY');
		initialFilter = start_date+" ~ "+end_date;

		/************************************/
		table = $('#example').DataTable( {
			"processing": true,
			"serverSide": true,
			"ajax": {
				url:"../rest/iieh/buscar_incidencias_ssp",
				beforeSend:function(){
					$("#over_table_lay").show();
                    ajax_saved_settings = this.url;
				},
				complete:function(){
					$("#over_table_lay").hide();
				},
				"data": function ( d ) {
					d.pageSize = table.page.info().length;
					d.pageNumber = table.page.info().page+1;
				},
				"dataSrc": function ( json ) {
					return json.data;
				}
			},
			"searchDelay": delay,
			"language": {
				"url": "../language/lang_es.json",
			},
			searchCols: [
				null,
				null,
				{'search': initialFilter },
				null,
				null,
				null,
				null,
				null,
				null,
				null
			],
			columnDefs: [
				{
					targets: [0,1,2,3,4,7],
					className: 'text-left'
				},{
					targets: [5,6],
					className: 'text-right',
					render: function ( data, type, row ) {
						return data.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "." );
					}
				},{
					targets: [8,9],
					className: 'text-center'
				}
			],
			drawCallback:function(){
				page_info = table.page.info();
			},
			initComplete: function () {
				$(".range").val(initialFilter); 
				$(".dataTables_processing").load('../img/loader.svg');
				var start = new Date();
				this.api().columns().every( function () {
					var first = this;
                    $( 'input' , this.footer() ).on( 'keyup clear paste', function (event) {
                        if(event.keyCode != 8){
                            if(event.keyCode < 21)
                                return;
                        }
                        var second = this;
                        //if(!/^([a-zA-Z0-9 _-]+)$/.test(second.value)) return;
                        createProgressbar("progress_search" , (delay/1000)+"s" , hide)
                        start=new Date();
                        if ( first.search() !== this.value ) {
                            setTimeout(function(){
                                if ((new Date() - start)>delay) {
                                    first.search( second.value ).draw();
                                }
                            }, delay);
                        }
                    } );
				} );
				$('#example tfoot th .range').daterangepicker({
					startDate:start_date,
					endDate:end_date,
					autoUpdateInput: false,
					drops:"auto",
					showDropdowns: true,
					minYear: 2000,
					maxYear: new Date(),
					locale: {
					  format: 'DD-MM-YYYY',
					  cancelLabel: 'Cancelar',
					  applyLabel:"Aplicar",
					  daysOfWeek: [
							"Do",
							"Lu",
							"Ma",
							"Mi",
							"Ju",
							"Vi",
							"Sa"
						],
						monthNames: [
							"Enero",
							"Febrero",
							"Marzo",
							"Abril",
							"Mayo",
							"Junio",
							"Julio",
							"Agosto",
							"Septiembre",
							"Octubre",
							"Noviembre",
							"diciembre"
						],
						firstDay: 1
					},
					beforeShow: function(input, inst) {
						inst.dpDiv.css({
							marginTop: -input.offsetHeight + 'px', 
							marginLeft: input.offsetWidth + 'px'
						});
					}
				});
				$('#example tfoot th .range').on('apply.daterangepicker', function(ev, picker) {
					$(this).val(picker.startDate.format('DD/MM/YYYY') + ' ~ ' + picker.endDate.format('DD/MM/YYYY'));
					$(this).trigger("keyup");
				});
				/* $('.date').on('cancel.daterangepicker', function(ev, picker) {
					var element = $(picker.element);
					if(element.val() != ""){
						element.val("");
						element.trigger("keyup");
					}
				}); */
			}
		} );
		$("#exporter button").click(function(){
			if(page_info.recordsDisplay > limitance_export){
				alert("No es posible exportar, demasiados registros, superan el máximo permitido de "+limitance_export.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "." )+".");
				return;
			}
			$("#overlay").css({visibility: "visible"}).animate({opacity: 1}, 250);
			$("#exporter button").prop("disabled" , true);
			let spliter = ajax_saved_settings.split("?");
			$.ajax({
				url:"../rest/iieh/export_filter",
				data:spliter[1]+"&type=export",
				success:function(data){
					let exportArray = [];
					var json = data;
					let headers = [];
					$("#example thead tr th").each(function(index , val){
						headers.push($(val).text());
					});
					let csvContent = "data:text/csv;charset=utf-8,\n" +headers.join(";")+"\n"
						+ json.data.map(e => e.join(";")).join("\n");
					var encodedUri = encodeURI(csvContent);
					var link = document.createElement("a");
					link.setAttribute("href", encodedUri);
					link.setAttribute("download", "incidencias iieh "+moment().format("DD-MM-YYYY")+".csv");
					document.body.appendChild(link);

					link.click();
					link.remove();
					$("#overlay").css({visibility: "visible"}).animate({opacity: 1}, 250);
					$("#overlay").animate({
						opacity: 0
					}, 250 ,  function(){ 
						$(this).css({"visibility" : "hidden"});
						$("#exporter button").prop("disabled" , false);
					});
				}
			});
		});
		$(".clear_filter img").click(function(){
			$(".has_filter input").val("");
			$(".range").val(initialFilter);
			$('#example').DataTable().columns(2).search(initialFilter).draw();
		});
	});

	function createProgressbar(id, duration, callback) {
        $(".inner").remove();
        $("#"+id).show()

        var progressbar = document.getElementById(id);
		
        progressbar.className = 'progressbar';

        var progressbarinner = document.createElement('div');

        progressbarinner.className = 'inner';
        progressbarinner.style.animationDuration = duration;
        if (typeof(callback) === 'function')
			progressbarinner.addEventListener('animationend', callback);
			progressbar.appendChild(progressbarinner);
			progressbarinner.style.animationPlayState = 'running';
    	}

    function hide(){
        $("#progress_search").hide();
    }
}