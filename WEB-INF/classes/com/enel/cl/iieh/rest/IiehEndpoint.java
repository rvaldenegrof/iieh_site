package com.enel.cl.iieh.rest;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.security.Principal;
import java.sql.Connection;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.enterprise.context.RequestScoped;
import javax.servlet.http.HttpServletRequest;
import javax.sql.DataSource;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;

import com.enel.cl.iieh.jdbc.AbstractDBManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Calendar;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.DELETE;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.UriInfo;
import org.json.JSONObject;

@RequestScoped
@Path("/iieh")
@Produces("application/json")
@Consumes("application/json")
public class IiehEndpoint extends AbstractDBManager {
    
    private static SimpleDateFormat sdf_iso = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
    private static SimpleDateFormat sdf_enel = new SimpleDateFormat("HH:mm:ss dd-MM-yyyy");
    
    //@Resource(lookup = "java:/jdbc/iieh/reportestst")
    @Resource(lookup = "java:/jdbc/iieh/reportes")
    //@Resource(lookup = "java:/jdbc/iieh/reportestst")
    private DataSource dataSource;
    
    @Override
    protected DataSource getDatasource() {
        return dataSource;
    }
    
    @GET
    @Path("/buscar_incidencias_ssp")
    public HashMap<String,Object> sspWorker(@Context UriInfo ui) throws SQLException {
        Connection conn = getConnection();
        String query = ui.getRequestUri().getQuery();
        String fromTable = "iieh_mensajes_detalles";
        String primary = "idet_id";
        String[] queryColumns = { 
            "idet_fechahorainforme",
            "idet_numerointerrupcion",
            "idet_fechainterrupcion",
            "IDET_FECHATERMINOINTERRUPCION",
            "idet_tiempointerrumpido",
            "idet_cantidadclienteiniciales",
            "idet_cantidadclientesafectados",
            "ic.icom_nombre",
            "nvl(pa.line_desc_agui,idet_alimentador)",
            "idet_subestacion"
        };
        Map<String, String> columnsFilter = new LinkedHashMap<String, String>();
        Map<String, String> orders = new LinkedHashMap<String, String>();
        
        String where = "" ,  order = "" ,  limit = "" , globalSearch = "" , columnSearch = "";
                
        Map<String, String> query_pairs = new LinkedHashMap<String, String>();
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            query_pairs.put(pair.substring(0, idx), pair.substring(idx + 1));
            
            if(pair.substring(0, idx).startsWith("order"))
                orders.put(pair.substring(0, idx), pair.substring(idx + 1));
            if(pair.substring(0, idx).startsWith("columns"))
                columnsFilter.put(pair.substring(0, idx), pair.substring(idx + 1));
        }
        if(query_pairs.containsKey("start") && query_pairs.containsKey("length"))
            limit = "row_num between "+query_pairs.get("start")+" and "+query_pairs.get("length");
        /****************** AQUI ES POR COLUMNA ***********/
        ArrayList<String> global = new ArrayList<String>();
        ArrayList<String> local = new ArrayList<String>();
        /****************** AQUI ES GLOBAL ****************/
        if(query_pairs.containsKey("search[value]") && !query_pairs.get("search[value]").equals("")){
            for (String queryColumn : queryColumns) {
                global.add(queryColumn + " LIKE '%" + query_pairs.get("search[value]") + "%' ");
            }
        }
        for(int i = 0 ; i < queryColumns.length ; i++){
            if(columnsFilter.containsKey("columns["+i+"][search][value]") && !columnsFilter.get("columns["+i+"][search][value]").equals("") && columnsFilter.get("columns["+i+"][searchable]").equals("true")){
                if(i != 2){
                    local.add(queryColumns[i]+" LIKE '%"+columnsFilter.get("columns["+i+"][search][value]")+"%'");
                }else{
                    String[] split = columnsFilter.get("columns[2][search][value]").split(" ~ ");
                    
                    local.add(queryColumns[i]+" BETWEEN '"+split[0]+"' AND '"+split[1]+"'");
                }
            }
        }
        globalSearch = !global.isEmpty() ? " ("+String.join(" OR ", global)+") " : "";
        columnSearch = !local.isEmpty() ? " ("+String.join(" AND ", local)+") " : "";
        
        if(!globalSearch.equals("") && !columnSearch.equals(""))
            where = " WHERE "+globalSearch+" AND "+columnSearch;
        if(!globalSearch.equals(""))
            where = " WHERE "+globalSearch;
        if(!columnSearch.equals(""))
            where = " WHERE "+columnSearch;
        if(orders.size() > 0){
            for(int i = 0 ;  i < orders.size() ; i ++){
                if(orders.get("order["+i+"][column]") != null){
                    order += order.equals("") ? "ORDER BY " : "";
                    order += queryColumns[Integer.parseInt(orders.get("order["+i+"][column]"))]+" "+orders.get("order["+i+"][dir]")+",";
                }
            }
            order = order.substring(0 , order.length()-1);
        }
        String sqlQuery = "SELECT * FROM\n" +
                            "(\n" +
                            "    SELECT a.*, rownum r__\n" +
                            "    FROM\n" +
                            "    (select \n" + String.join("," , queryColumns)+" , rownum row_num\n"+
                                "from \n" + fromTable+"\n"+
                            "inner join iieh_comunas ic on ic.icom_comuna = idet_comuna\n" +
                            "left join pareo_alim pa on pa.line_id_agui = idet_alimentador\n"+
                            where+"\n"+
                            order+") a\n" +
                            "    WHERE rownum < (("+query_pairs.get("pageNumber")+" * "+query_pairs.get("pageSize")+") + 1 )\n" +
                            ")\n" +
                            "WHERE r__ >= ((("+query_pairs.get("pageNumber")+"-1) * "+query_pairs.get("pageSize")+") + 1)";
        String totalRecords = "SELECT COUNT("+primary+") as total FROM "+fromTable+" INNER JOIN iieh_comunas ic ON ic.icom_comuna = idet_comuna\n" +
"                                   LEFT JOIN pareo_alim pa ON pa.line_id_agui = idet_alimentador";
        String filteredRecords = "select COUNT("+primary+") as total from(select idet_id \n"+
                            "from \n" + fromTable+"\n"+
                            "inner join iieh_comunas ic on ic.icom_comuna = idet_comuna\n" +
                            "left join pareo_alim pa on pa.line_id_agui = idet_alimentador\n"+
                            where+")";
        /*********** PREPARE RETURN :D ***********/
        HashMap<String,Object> result = new HashMap<>();
        try{
            result.put("draw" , query_pairs.get("draw"));
            result.put("recordsTotal" , getCounts(conn , totalRecords));
            result.put("recordsFiltered" , getCounts(conn , filteredRecords));
            result.put("data" , extractData(conn , sqlQuery));


            /*ExecutorService taskExecutor = Executors.newFixedThreadPool(3);
                taskExecutor.submit(() -> result.put("recordsTotal" , getCounts(conn , totalRecords)));
                taskExecutor.submit(() -> result.put("recordsFiltered" , getCounts(conn , filteredRecords)));
                taskExecutor.submit(() -> result.put("data" , extractData(conn , sqlQuery)));
            taskExecutor.shutdown();*/
            result.put("ALL_QUERY" , sqlQuery);
            result.put("TOTAL_QUERY" , totalRecords);
            result.put("FILTERED_QUERY" , filteredRecords);
            result.put("CONNECTION_URL" , conn.getMetaData().getURL());
            result.put("CONNECTION_USER" , conn.getMetaData().getUserName());
            result.put("TODO_BIEN" , "its ok");
        }catch(SQLException ex){
            result.put("TENGO_ERROR" , ex.getMessage());
        }
        /*try {
            taskExecutor.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);
        } catch (InterruptedException ex) { }*/
        return result;
    }
    
    @GET
    @Path("/export_filter")
    public HashMap<String,Object> exporterFilter(@Context UriInfo ui) throws SQLException {
        Connection conn = getConnection();
        String query = ui.getRequestUri().getQuery();
        String fromTable = "iieh_mensajes_detalles";
        String primary = "idet_id";
        String[] queryColumns = { 
            "idet_fechahorainforme",
            "idet_numerointerrupcion",
            "idet_fechainterrupcion",
            "IDET_FECHATERMINOINTERRUPCION",
            "idet_tiempointerrumpido",
            "idet_cantidadclienteiniciales",
            "idet_cantidadclientesafectados",
            "ic.icom_nombre",
            "nvl(pa.line_desc_agui,idet_alimentador)",
            "idet_subestacion"
        };
        Map<String, String> columnsFilter = new LinkedHashMap<String, String>();
        Map<String, String> orders = new LinkedHashMap<String, String>();
        
        String where = "" ,  order = "" , globalSearch = "" , columnSearch = "";
                
        Map<String, String> query_pairs = new LinkedHashMap<String, String>();
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            query_pairs.put(pair.substring(0, idx), pair.substring(idx + 1));
            
            if(pair.substring(0, idx).startsWith("order"))
                orders.put(pair.substring(0, idx), pair.substring(idx + 1));
            if(pair.substring(0, idx).startsWith("columns"))
                columnsFilter.put(pair.substring(0, idx), pair.substring(idx + 1));
        }
        /****************** AQUI ES POR COLUMNA ***********/
        ArrayList<String> global = new ArrayList<>();
        ArrayList<String> local = new ArrayList<>();
        /****************** AQUI ES GLOBAL ****************/
        if(query_pairs.containsKey("search[value]") && !query_pairs.get("search[value]").equals("")){
            for (String queryColumn : queryColumns) {
                global.add(queryColumn + " LIKE '%" + query_pairs.get("search[value]") + "%' ");
            }
        }
        for(int i = 0 ; i < queryColumns.length ; i++){
            if(columnsFilter.containsKey("columns["+i+"][search][value]") && !columnsFilter.get("columns["+i+"][search][value]").equals("") && columnsFilter.get("columns["+i+"][searchable]").equals("true")){
                if(i != 2){
                    local.add(queryColumns[i]+" LIKE '%"+columnsFilter.get("columns["+i+"][search][value]")+"%'");
                }else{
                    String[] split = columnsFilter.get("columns[2][search][value]").split(" ~ ");
                    
                    local.add(queryColumns[i]+" BETWEEN '"+split[0]+"' AND '"+split[1]+"'");
                }
            }
        }
        globalSearch = !global.isEmpty() ? " ("+String.join(" OR ", global)+") " : "";
        columnSearch = !local.isEmpty() ? " ("+String.join(" AND ", local)+") " : "";
        
        if(!globalSearch.equals("") && !columnSearch.equals(""))
            where = " WHERE "+globalSearch+" AND "+columnSearch;
        if(!globalSearch.equals(""))
            where = " WHERE "+globalSearch;
        if(!columnSearch.equals(""))
            where = " WHERE "+columnSearch;
        if(orders.size() > 0){
            for(int i = 0 ;  i < orders.size() ; i ++){
                if(orders.get("order["+i+"][column]") != null){
                    order += order.equals("") ? "ORDER BY " : "";
                    order += queryColumns[Integer.parseInt(orders.get("order["+i+"][column]"))]+" "+orders.get("order["+i+"][dir]")+",";
                }
            }
            order = order.substring(0 , order.length()-1);
        }
        String sqlQuery = "select \n" + String.join("," , queryColumns)+"\n"+
                                "from \n" + fromTable+"\n"+
                            "inner join iieh_comunas ic on ic.icom_comuna = idet_comuna\n" +
                            "left join pareo_alim pa on pa.line_id_agui = idet_alimentador\n"+
                            where+"\n"+
                            order;
        /*********** PREPARE RETURN :D ***********/
        HashMap<String,Object> result = new HashMap<>();
        result.put("data" , extractData(conn , sqlQuery));
        return result;
    }
    
    @GET
    @Path("/listarRPT")
    public List<Map<String, Object>> listRPT() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 81, null);
        safeClose(conn);
        return result;
    }
    @GET
    @Path("/editarRPT")
    public int editarRPT(                         @QueryParam("linea")        final String linea,
                                                @QueryParam("cto")          final Integer cto,
                                                @QueryParam("barra")        final Integer barra,
                                                @QueryParam("bf")           final Integer bf,
                                                @QueryParam("sdac")         final Integer sdac,
                                                @QueryParam("ce")           final Integer ce,
                                                @QueryParam("subestacion")  final String subestacion,
                                                @QueryParam("alimentador")  final String alimentador,
                                                @QueryParam("alim_id")      final Integer alim_id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        /*******************/
        params.add(linea);
        params.add(cto);
        params.add(barra);
        params.add(bf);
        params.add(sdac);
        params.add(ce);
        params.add(alimentador);
        /******************/
        int result = executeUpdateWithReturn(conn, 82, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/eliminarRPT")
    public int eliminarRPT(@QueryParam("alim_id") final Integer id_alimentador) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id_alimentador);
        int result = executeUpdate(conn, 83, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/crearRPT")
    public int crearRPT(@Context UriInfo uriInfo) {
        Logger log = Logger.getLogger(AbstractDBManager.class.getSimpleName());
        int id = -1;
        try{
            List<Object> params = new ArrayList<>();
            Connection conn = getConnection();
            String query = uriInfo.getRequestUri().getQuery();
            Map<String, String> query_pairs = new LinkedHashMap<>();
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                query_pairs.put(pair.substring(0, idx), pair.substring(idx + 1));
            }
            
            /*******************/
            params.add(query_pairs.get("LINEA"));
            params.add(query_pairs.get("CTO"));
            params.add(query_pairs.get("BARRA"));
            params.add(query_pairs.get("BF"));
            params.add(query_pairs.get("SDAC"));
            params.add(query_pairs.get("CE"));
            params.add(query_pairs.get("SUBESTACION"));
            params.add(query_pairs.get("ALIMENTADOR"));
            
            log.log(Level.WARNING, params.toString(), "");
            /******************/
            id = executeUpdate(conn, 84, params);
            safeClose(conn);
        }catch(Exception ex){
            log.log(Level.WARNING, "ERROR_NOOB", ex.getMessage());
        }
        
        return id;
    }
    
    @GET
    @Path("/lista")
    public List<Map<String, Object>> getLista() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 80, null);
        safeClose(conn);
        return result;
    }

    
    @GET
    @Path("/comunas")
    public List<Map<String, Object>> getComunas(@QueryParam("start") final Integer startPosition, @QueryParam("max") final Integer maxResult) {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 1, null, startPosition, maxResult);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/empresas")
    public List<Map<String, Object>> getEmpresas(@QueryParam("start") final Integer startPosition, @QueryParam("max") final Integer maxResult) {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 2, null, startPosition, maxResult);
        safeClose(conn);
        return result;
    }
    
    private List<Map<String, Object>> getMensaje(Integer id) {
        List<Object> params = new ArrayList<>();
        params.add(id);
        params.add(id);
        
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 24, params);
        safeClose(conn);
        return result;
    }
    
    private List<Map<String, Object>> getMensajes() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 3, null);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/mensaje")
    public List<Map<String, Object>> getMensaje(@QueryParam("id") final Integer id, @QueryParam("start") final Integer startPosition, @QueryParam("max") final Integer maxResult) {
        return getMensaje(id);
    }
    
    @GET
    @Path("/mensajes")
    public List<Map<String, Object>> getMensajes(@QueryParam("idEmpresa") final Integer idEmpresa, @QueryParam("usuario") final String user, @QueryParam("fechaDesde") final String fechaDesde, @QueryParam("fechaHasta") final String fechaHasta, @QueryParam("start") final Integer startPosition, @QueryParam("max") final Integer maxResult) {
        return getMensajes();
    }
    
    @GET
    @Path("/listar_alimentadores_mensajes")
    public List<Map<String, Object>> getAlimentadores(@QueryParam("id") final Integer id) {
        List<Object> params = new ArrayList<>();
        params.add(id);
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 25, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/listar_mensajes_editar")
    public List<Map<String, Object>> getMensajesEditar() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 32, null);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/listar_mensajes_cerrar")
    public List<Map<String, Object>> getMensajesCerrar() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 33, null);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/detalle_mensaje")
    public List<Map<String, Object>> getDetalleMensaje(@QueryParam("id") final Integer id, @QueryParam("start") final Integer startPosition, @QueryParam("max") final Integer maxResult) {
        List<Object> params = new ArrayList<>();
        params.add(id);
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 4, params, startPosition, maxResult);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/detalle_envios_mensaje")
    public List<Map<String, Object>> getDetalleEnviosMensaje(@QueryParam("id") final Integer id, @QueryParam("start") final Integer startPosition, @QueryParam("max") final Integer maxResult) {
        List<Object> params = new ArrayList<>();
        params.add(id);
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 5, params, startPosition, maxResult);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/mensaje_at")
    public List<Map<String, Object>> getMensajesAt(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Map<String, Object>> result ;
        if (id != null){
            List<Object> params = new ArrayList<>();
            params.add(id);
            result = executeQuery(conn, 23, params);
        } else {
            result = executeQuery(conn, 6, null);
//            for(int i = 0; i < result.size();i++){
//                String valor = result.get(i).get("NUMEROINTERRUPCION").toString();
//                Map<String, Object> elementoModificar = result.get(i);
//                elementoModificar.put("NUMEROINTERRUPCION", valor);
//                result.set(i, elementoModificar);
//            }
        }
        safeClose(conn);
        return result;
    }
    
    
    @PUT
    @Path("/mensaje_at")
    public List<Map<String, Object>> createMensajeAt(Map<String, Object> mapacrear) {
        Timestamp fechainterrupcion;
        Timestamp fechaestimadareposicion;
        try {
            fechainterrupcion = new Timestamp(sdf_enel.parse((String) mapacrear.get("fechainterrupcion")).getTime());
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
        
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        
        try{
            int mtbt = 0;
            int empresa = (int) mapacrear.get("empresa");
            if(mapacrear.get("mtbt") != null){
                mtbt = (int) mapacrear.get("mtbt");
            }
            
            String descripcion = (String) mapacrear.get("descripcion");
            @SuppressWarnings("unchecked")
                    List<Map<String, Object>> data = (List<Map<String, Object>>) mapacrear.get("data");
            
            Connection conn = getConnection();
            List<Map<String, Object>> nextidmap = executeQuery(conn, 8, null);
            BigDecimal id = (BigDecimal) nextidmap.get(0).get("NEXTID");
            
            List<Object> params = new ArrayList<>();
            params.add(id);
            params.add(fechainterrupcion);
            params.add(getUsername());
            params.add(descripcion);
            if(mtbt == 1){
                params.add(2);
            } else{
                params.add(1);
            }
            params.add(empresa);
            executeUpdate(conn, 9, params);
            
            int seqdet = 0;
            for (Map<String, Object> mapdata : data) {
                if (!(boolean) mapdata.get("selected"))
                    continue;
                params = new ArrayList<>();
                params.add(id);
                params.add(fechainterrupcion);
                params.add(mapdata.get("LINEA"));
                params.add(mapdata.get("CTO"));
                params.add(mapdata.get("BARRA"));
                params.add(mapdata.get("BF"));
                params.add(mapdata.get("SDAC"));
                params.add(mapdata.get("CE"));
                params.add(mapdata.get("SUBESTACION"));
                params.add(mapdata.get("ALIMENTADOR"));
                if(mtbt == 1){
                    params.add(mapdata.get("COMUNA_ID"));
                } else{
                    params.add(mapdata.get("ID_COMUNA_SEC"));
                }                
                params.add(mapdata.get("CANT_CLI"));
                params.add(seqdet++);
                params.add(getUsername());
                if(mtbt == 1){
                    fechaestimadareposicion = null;
                } else{
                    fechaestimadareposicion = new Timestamp(sdf_enel.parse((String)mapdata.get("FECHA_ESTIMADA_REPOSICION")).getTime());
                }                
                params.add(fechaestimadareposicion);                                                                                                    
                executeUpdate(conn, 10, params);
            }
            
            params = new ArrayList<>();
            params.add(id);
            params.add(id);
            params.add(getUsername());
            params.add(id);
            executeUpdate(conn, 12, params);
            
            commit(conn);
            safeClose(conn);
            return nextidmap;
        } catch (Exception e) {
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            Map<String, Object> map2 = new HashMap<String, Object>();
            map1.put("excepcion", e.getMessage());
            map2.put("excepcion", e.getStackTrace());
            mapa.add(map1);
            mapa.add(map2);
        }
        return mapa;
        
    }
    
    @PUT
    @Path("/mensaje_crear")
    public List<Map<String, Object>> createMensaje(Map<String, Object> mapacrear) {
        
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        int resultado = 0;
        
        try
        {
            Connection conn = getConnection();
            List<Map<String, Object>> nextidmap = executeQuery(conn, 26, null);
            BigDecimal id = (BigDecimal) nextidmap.get(0).get("NEXTID");
            
            
            
            String fechaMensaje = (String) mapacrear.get("fechaMensaje");
            String fechaMensajeFormat = fechaMensaje.replace("/", "-");
            
            int cantRegistros = (int) mapacrear.get("cantRegistros");
            int iempId = (int) mapacrear.get("iempId");
            int codSec = (int) mapacrear.get("codSec");
            int codProceso = (int) mapacrear.get("codProceso");
            String usuModifica = (String) mapacrear.get("usuModifica");
            
            
            /*String[] parts = fechaMensaje.split(" ");
            String part1 = parts[0]; // YYYY/MM/DD
            String[] parts2 = part1.split("/");
            String yy = parts2[0].substring(2, 4);
            String mm = parts2[1];
            String dd = parts2[2];
            
            String strSecuenciaCompuestaLike = new StringBuilder(9).append(codSec).append(yy).append(mm).append(dd).append("%").toString();
            String strSecuenciaCompuesta = new StringBuilder(11).append(codSec).append(yy).append(mm).append(dd).toString();
            
            List<Object> paramsNumInterrupcion = new ArrayList<>();
            paramsNumInterrupcion.add(strSecuenciaCompuestaLike);
            List<Map<String, Object>> existeResult = executeQuery(conn, 29, paramsNumInterrupcion);
            BigDecimal cantHoy = (BigDecimal) existeResult.get(0).get("EXISTE");
            int cantidadHoy = cantHoy.intValue();*/
            
            
            Date ahora = new Date();
            DateFormat df = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            String h = df.format(ahora);
            h = h.replace("/", "-");
            
            
            
            List<Object> params = new ArrayList<>();
            params.add(id);
            params.add(fechaMensajeFormat);
            params.add(cantRegistros);
            params.add(iempId);
            params.add(codSec);
            params.add(codProceso);
            params.add(usuModifica);
            params.add(h);
            executeUpdate(conn, 27, params);
            
            
            @SuppressWarnings("unchecked")
                    List<Map<String, Object>> records = (List<Map<String, Object>>) mapacrear.get("data");
            @SuppressWarnings("unchecked")
                    
                    
                    
                    Map<String, Object> clientesIniciales = (Map<String, Object>)mapacrear.get("clientesIniciales");
            @SuppressWarnings("unchecked")
                    Map<String, Object> clientesAfectados = (Map<String, Object>)mapacrear.get("clientesAfectados");
            @SuppressWarnings("unchecked")
                    Map<String, Object> tiempoInterrupcion = (Map<String, Object>) mapacrear.get("tiempoInterrupcion");
            @SuppressWarnings("unchecked")
                    Map<String, Object> fechaTerminoInterrupcion = (Map<String, Object>) mapacrear.get("fechaTerminoInterrupcion");
            @SuppressWarnings("unchecked")
                    Map<String, Object> fechaInterrupcion = (Map<String, Object>) mapacrear.get("fechaInterrupcion");
            
            @SuppressWarnings("unchecked")
                    Map<String, Object> cuadrillasPesadas = (Map<String, Object>) mapacrear.get("cuadrillasPesadas");
            @SuppressWarnings("unchecked")
                    Map<String, Object> cuadrillasLivianas = (Map<String, Object>) mapacrear.get("cuadrillasLivianas");
            
            @SuppressWarnings("unchecked")
                    Map<String, Object> numeroInterrupcion = (Map<String, Object>) mapacrear.get("numeroInterrupcion");
            
            
            
            int idx = 1;
            for (Map<String, Object> mapdata : records) {
                
                
                if (!(boolean) mapdata.get("selected")){
                    idx = idx +1;
                    continue;
                }
                
                
                int iniciales = 0;
                int afectados = 0;
                int livianas = 0;
                int pesadas = 0;
                float tiempoInterrumpido = 0;
                
                String fInter = "";
                String fTerInter = "";
                BigInteger numInter = new BigInteger("0");
                
                /*cantidadHoy = cantidadHoy + 1;
                String numeroCompuesto = String.format("%03d", cantidadHoy);
                String strSecuenciaCompuestaFinal = strSecuenciaCompuesta.concat(numeroCompuesto);*/
                
                /*Map<String, Object> map2 = new HashMap<String, Object>();
                map2.put("key", "numeroCompuesto:  " + numeroCompuesto + " strSecuenciaCompuestaFinal:  " + strSecuenciaCompuestaFinal);
                mapa.add(map2);*/
                
                for (Map.Entry<String, Object> entry : clientesIniciales.entrySet()) {
                    String key = entry.getKey();
                    if(key.equals("" +idx)) {
                        iniciales = Integer.parseInt(entry.getValue().toString());
                    }
                }
                
                
                for (Map.Entry<String, Object> entry : clientesAfectados.entrySet()) {
                    String key = entry.getKey();
                    if(key.equals("" +idx)) {
                        afectados = Integer.parseInt(entry.getValue().toString());
                    }
                }
                
                for (Map.Entry<String, Object> entry : cuadrillasLivianas.entrySet()) {
                    String key = entry.getKey();
                    /* Map<String, Object> map7 = new HashMap<String, Object>();
                    map7.put("livianasKey", key);
                    mapa.add(map7);
                    
                    Map<String, Object> map8 = new HashMap<String, Object>();
                    map8.put("idx", idx);
                    mapa.add(map8);*/
                    
                    if(key.equals("" +idx)) {
                        /*Map<String, Object> map9 = new HashMap<String, Object>();
                        map9.put("ENTRO", entry.getValue());
                        mapa.add(map9);*/
                        livianas = Integer.parseInt(entry.getValue().toString());
                    }
                }
                
                for (Map.Entry<String, Object> entry : cuadrillasPesadas.entrySet()) {
                    String key = entry.getKey();
                    if(key.equals("" +idx)) {
                        pesadas = Integer.parseInt(entry.getValue().toString());
                    }
                }
                
                
                for (Map.Entry<String, Object> entry : tiempoInterrupcion.entrySet()) {
                    String key = entry.getKey();
                    if(key.equals("" +idx)) {
                        tiempoInterrumpido = Float.parseFloat(entry.getValue().toString());
                    }
                }
                
                
                for (Map.Entry<String, Object> entry : fechaInterrupcion.entrySet()) {
                    String key = entry.getKey();
                    if(key.equals("" +idx)) {
                        fInter = entry.getValue().toString().replace("/", "-");
                    }
                }
                for (Map.Entry<String, Object> entry : fechaTerminoInterrupcion.entrySet()) {
                    String key = entry.getKey();
                    if(key.equals("" +idx)) {
                        fTerInter = entry.getValue().toString().replace("/", "-");
                    }
                }
                
                for (Map.Entry<String, Object> entry : numeroInterrupcion.entrySet()) {
                    String key = entry.getKey();
                    if(key.equals("" +(idx - 1))) {
                        numInter =  new BigInteger(entry.getValue().toString());
                    }
                }
                
                if(fTerInter.equals("")){
                    fTerInter = "1900-01-01 00:00:00";
                }
                
                
                List<Map<String, Object>> nextID = executeQuery(conn, 30, null);
                BigDecimal idTemp = (BigDecimal) nextID.get(0).get("NEXTID");
                
                List<Map<String, Object>> nextIDInf = executeQuery(conn, 31, null);
                BigDecimal idInfTemp = (BigDecimal) nextIDInf.get(0).get("NEXTID");
                
                params = new ArrayList<>();
                params.add(idTemp);
                params.add(idInfTemp);
                params.add(fechaMensajeFormat); //fecha del mensaje, fecha provisoria
                params.add(13);
                params.add(mapdata.get("COMUNA_CABECERA_ID"));
                params.add(afectados);
                params.add(id); //foraneo
                params.add(usuModifica);
                params.add(h);//params.add(fecModifica); //?    //fecha provisoria
                params.add(codSec);
                params.add(fInter);//params.add(fecInter);  //fecha provisoria
                params.add(mapdata.get("SUBESTACION"));
                params.add(mapdata.get("ALIMENTADOR_ID"));
                
                
                
                params.add(tiempoInterrumpido);
                params.add(iniciales);
                params.add(livianas);
                params.add(pesadas);
                params.add(2);
                params.add(fTerInter);//params.add(fecTerminoInter);  //fecha provisoria
                params.add(mapdata.get("NODO_OPERADO"));
                params.add(numInter); //secuencias?
                
                idx = idx +1;
                resultado = executeUpdate(conn, 28, params);
            }
            
            
            commit(conn);
            safeClose(conn);
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", resultado);
            mapa.add(map1);
            
            return mapa;
        } catch (Exception e) {
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", 0);
            mapa.add(map1);
            return mapa;
        }
        
    }
    @POST
    @Path("/mensaje_at")
    public List<Map<String, Object>> updateMensajeAt(Map<String, Object> mapaactualizar) throws ParseException {
        Integer id = (Integer) mapaactualizar.get("id");
        Timestamp fechaterminointerrupcion = null;
        Timestamp fechaestimadareposicion = null;
        boolean fechaNula = "".equals((String)mapaactualizar.get("fechaterminointerrupcion"));
        
        if(!fechaNula){
            try {
                fechaterminointerrupcion = new Timestamp(sdf_enel.parse((String) mapaactualizar.get("fechaterminointerrupcion")).getTime());
            } catch (ParseException e) {
                e.printStackTrace();
                return null;
            }
        }
        
        @SuppressWarnings("unchecked")
                List<Map<String, Object>> data = (List<Map<String, Object>>) mapaactualizar.get("data");
        
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        int cantClientes = 0;
        
        if(!fechaNula){
            params = new ArrayList<>();
            params.add(fechaterminointerrupcion);
            params.add(getUsername());
            params.add(0);
            params.add(id);
            executeUpdate(conn, 68, params);
        } else{
            for (Map<String, Object> mapdata : data) {
                Integer cc = Integer.parseInt(mapdata.get("CANT_CLI").toString());
                if (!(Boolean) mapdata.get("selected"))
                {
                    cc = 0;
                    params = new ArrayList<>();
                    params.add(id);
                    params.add(mapdata.get("SEQDET"));
                     executeUpdate(conn, 13, params);
                     
                    continue;
                }
                params = new ArrayList<>();
                params.add(null);
                params.add(getUsername());
                params.add(cc);
                if (mapdata.get("FECHAESTIMADAREPOSICION") == null) {
                    params.add(null);
                }else
                {
                    fechaestimadareposicion = new Timestamp(sdf_enel.parse((String)mapdata.get("FECHAESTIMADAREPOSICION")).getTime());
                    params.add(fechaestimadareposicion);                
                }
                params.add(id);
                params.add(mapdata.get("SEQDET"));
                executeUpdate(conn, 11, params);
                cantClientes += cc;
            }
        }
        
        params = new ArrayList<>();
        params.add(id);
        params.add(id);
        params.add(getUsername());
        params.add(id);
        executeUpdate(conn, 12, params);
        
        params = new ArrayList<>();
        params.add(cantClientes > 0 ? null : fechaterminointerrupcion);
        params.add(getUsername());
        params.add(id);
        params.add(id);
        executeUpdate(conn, 14, params);
        
        commit(conn);
        safeClose(conn);
        return new ArrayList<>();
    }
    
    
    @POST
    @Path("/seq_numero_interrupcion")
    public List<Map<String, Object>> getSeqNumIterrupcion(Map<String, Object> mapacrear) {
        
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        
        try
        {
            String fechaMensaje = (String) mapacrear.get("fechaMensaje");
            int codSec = (int) mapacrear.get("codSec");
            
            String[] parts = fechaMensaje.split(" ");
            String part1 = parts[0]; // YYYY/MM/DD
            String[] parts2 = part1.split("/");
            String yy = parts2[0].substring(2, 4);
            String mm = parts2[1];
            String dd = parts2[2];
            
            String strSecuenciaCompuestaLike = new StringBuilder(9).append(codSec).append(yy).append(mm).append(dd).append("%").toString();
            
            List<Object> paramsNumInterrupcion = new ArrayList<>();
            paramsNumInterrupcion.add(strSecuenciaCompuestaLike);
            
            Connection conn = getConnection();
            List<Map<String, Object>> existeResult = executeQuery(conn, 29, paramsNumInterrupcion);
            BigDecimal cantHoy = (BigDecimal) existeResult.get(0).get("EXISTE");
            
            
            int cantidadHoy = cantHoy.intValue();
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("cantidadHoy", cantidadHoy);
            mapa.add(map1);
            
            
            safeClose(conn);
        }
        catch (Exception e) {
            Map<String, Object> map1 = new HashMap<String, Object>();
            Map<String, Object> map2 = new HashMap<String, Object>();
            map1.put("excepcion", e.getMessage());
            map2.put("excepcion", e.getStackTrace());
            mapa.add(map1);
            mapa.add(map2);
        }
        return mapa;
    }
    
    
    
    @GET
    @Path("/at_parameter")
    public List<Map<String, Object>> getAtParameters() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 7, null);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/at_inci_parameter")
    public List<Map<String, Object>> getAtInciParameters(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        List<Map<String, Object>> result = executeQuery(conn, 18, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/at_inci_detail")
    public List<Map<String, Object>> getAtInciDetail(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        params.add(id);
        params.add(id);
        params.add(id);
        params.add(id);
        List<Map<String, Object>> result = executeQuery(conn, 19, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/at_inci_detailMTBT")
    public List<Map<String, Object>> getAtInciDetailMTBT(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        params.add(id);
        params.add(id);
        params.add(id);
        params.add(id);
        params.add(id);
        params.add(id);
        params.add(id);
        List<Map<String, Object>> result = executeQuery(conn, 42, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/at_inci_comunas")
    public List<Map<String, Object>> getAtInciComunas(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        params.add(id);
        List<Map<String, Object>> result = executeQuery(conn, 20, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/alimentadores_at")
    public List<Map<String, Object>> getAlimentadores() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 15, null);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/clientes_at")
    public List<Map<String, Object>> getClientes() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 16, null);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/comunas_at")
    public List<Map<String, Object>> getCoumnaAt() {
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 17, null);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/date")
    public static List<Map<String, Object>> getDate() {
        
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        Date fecha = new Date();
        //fecha.setSeconds(0);
        String date = new SimpleDateFormat("k:mm:ss dd-MM-yyyy").format(fecha);
        
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("CURDATE", date);
        
        result.add(map);
        
        return result;
    }
    
    @Context
            HttpServletRequest req;
    
    private String getUsername() {
        Principal principal;
        if ((principal = req.getUserPrincipal()) != null) {
            return principal.getName();
        }
        return "web";
    }
    
    @GET
    @Path("/whoami")
    public List<Map<String, Object>> whoami(@Context HttpServletRequest req) {
        Principal principal = req.getUserPrincipal();
        if (principal == null)
            return new ArrayList<>();
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(principal.getName());
        List<Map<String, Object>> result = executeQuery(conn, 22, params);
        safeClose(conn);
        return result;
    }
    
    @POST
    @Path("/cerrar_mensaje")
    public List<Map<String, Object>> cerrarMensaje(Map<String, Object> paramCierre) {
        String alimentadorNumero = (String) paramCierre.get("alimentador");
        String interrupcionNumero = (String) paramCierre.get("interrupcion");
        String usucierre = (String) paramCierre.get("usucierre");
        
        String fechaCierre = (String) paramCierre.get("fechaCierre");
        int tipoCierre = (int) paramCierre.get("tipoCierre");
        
        Connection conn = getConnection();
        List<Map<String, Object>> listaCerrar = getRegistrosCerrar(paramCierre);
        
        for(int i = 0; i < listaCerrar.size(); i++){
            
            int cabecera = 0;
            for (Map<String, Object> map : listaCerrar) {
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    String key = entry.getKey();
                    if(key.equals("IDET_ICAB_ID")){
                        Object value = entry.getValue();
                        BigDecimal bd = (BigDecimal) value;
                        cabecera = bd.intValue();
                    }
                }
            }
            
            List<Object> params = new ArrayList<>();
            params.add(fechaCierre);
            params.add(0); // cant clientes
            params.add(tipoCierre); //cerrar con tipo 1
            params.add(usucierre);
            params.add(alimentadorNumero);
            params.add(interrupcionNumero);
            executeUpdate(conn, 34, params);
            
            params = new ArrayList<>();
            params.add(tipoCierre); //cerrar con tipo 1
            params.add(usucierre);
            params.add(cabecera); //cerrar con tipo 1
            executeUpdate(conn, 36, params);
        }
        
        commit(conn);
        safeClose(conn);
        return new ArrayList<>();
    }
    public Date removerMinutosSegundos(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }
    
    @POST
    @Path("/lista_registros_cerrar")
    public List<Map<String, Object>> getRegistrosCerrar(Map<String, Object> paramCierre) {
        String alimentador = (String) paramCierre.get("alimentador");
        String interrupcion = (String) paramCierre.get("interrupcion");
        
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(alimentador);
        params.add(interrupcion);
        List<Map<String, Object>> result = executeQuery(conn, 35, params);
        
        commit(conn);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/listar_edicion_manual")
    public List<Map<String, Object>> getEdicionManual(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        List<Map<String, Object>> result = executeQuery(conn, 37, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/alimentadores_mtbt")
    public List<Map<String, Object>> getAlimentadoresMTBT(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        List<Map<String, Object>> result = executeQuery(conn, 38, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/clientes_mtbt")
    public List<Map<String, Object>> getClientesMTBT(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        List<Map<String, Object>> result = executeQuery(conn, 39, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/comunas_mtbt")
    public List<Map<String, Object>> getCoumnaMTBT(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        List<Map<String, Object>> result = executeQuery(conn, 40, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/empresa_x_alimentador")
    public List<Map<String, Object>> getEmpresaByAlimentador(@QueryParam("numinterrupcion") final String numinterrupcion) {
        Connection conn = getConnection();
        List<Map<String, Object>> result ;
        List<Object> params = new ArrayList<>();
        params.add(numinterrupcion);
        result = executeQuery(conn, 41, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/mensaje_soloat")
    public List<Map<String, Object>> getMensajesSoloAt() {
        Connection conn = getConnection();
        List<Map<String, Object>> result ;
        result = executeQuery(conn, 45, null);
        safeClose(conn);
        return result;
    }
    @GET
    @Path("/mensaje_mtbt")
    public List<Map<String, Object>> getMensajesMTBT(@QueryParam("id") final Integer id) {
        Connection conn = getConnection();
        List<Map<String, Object>> result ;
        if (id != null){
            List<Object> params = new ArrayList<>();
            params.add(id);
            result = executeQuery(conn, 43, params);
        } else {
            result = executeQuery(conn, 44, null);
            
        }
        safeClose(conn);
        return result;
    }@GET
    @Path("/mensaje_atmtbt")
    public List<Map<String, Object>> getMensajesATMTBT(@QueryParam("tipoIncidencia") final Integer tipoIncidencia, @QueryParam("empresa") final Integer empresa) {
        Connection conn = getConnection();
        List<Map<String, Object>> result ;
        List<Object> params = new ArrayList<>();
        params.add(empresa);
        params.add(tipoIncidencia);
        result = executeQuery(conn, 71, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/permisos")
    public List<Map<String, Object>> getPermisos(@QueryParam("usuario") final String usuario) {
        Connection conn = getConnection();
        List<Map<String, Object>> result ;
        List<Object> params = new ArrayList<>();
        params.add(usuario);
        result = executeQuery(conn, 46, params);
        safeClose(conn);
        return result;
    }
    @GET
    @Path("/permisos_x_rol")
    public List<Map<String, Object>> getPermisosByRol(@QueryParam("rol") final String rol) {
        Connection conn = getConnection();
        List<Map<String, Object>> result ;
        List<Object> params = new ArrayList<>();
        params.add(rol);
        result = executeQuery(conn, 59, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/clientes_reporte")
    public List<Map<String, Object>> getClientesReporte() {
        
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 47, null);
        safeClose(conn);
        return result;
    }
    @GET
    @Path("/clientes_reporte_all")
    public List<Map<String, Object>> getClientesReporteAll() {
        
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 60, null);
        safeClose(conn);
        return result;
    }
    
    @POST
    @Path("/detalle_reporte")
    public List<Map<String, Object>> getDetalleReporte(Map<String, Object> paramCierre) {
        List<Map<String, Object>> result = null;
        try{
        int ano = (int) paramCierre.get("anho");
        int mes = (int) paramCierre.get("mes");
        int dia = (int) paramCierre.get("dia");
        int hora = (int) paramCierre.get("hora");
        int minuto = (int) paramCierre.get("minuto");
        List<Object> params = new ArrayList<>();
        params.add(ano);
        params.add(mes);
        params.add(dia);
        params.add(hora);
        params.add(minuto);
//        params.add(ano);
//        params.add(mes);
//        params.add(dia);
//        params.add(hora);
        //'anho=' + dia.ANHO + '&mes=' + dia.MES + '&dia=' + dia.DIA+ '&hora=' + dia.HORA;
        Connection conn = getConnection();
        result = executeQuery(conn, 48, params);
        safeClose(conn);
        
        }
         catch (Exception e) {
            Map<String, Object> map1 = new HashMap<String, Object>();
            Map<String, Object> map2 = new HashMap<String, Object>();
            map1.put("excepcion", e.getMessage());
            map2.put("excepcion", e.getStackTrace());
            result.add(map1);
            result.add(map2);
            
        }
        
        return result;
    }
    
    @GET
    @Path("/lista_usuarios")
    public List<Map<String, Object>> getUsuarios() {
        
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 49, null);
        safeClose(conn);
        return result;
    }
    @GET
    @Path("/lista_usuarios_x_empresa")
    public List<Map<String, Object>> getUsuariosEmpresa(@QueryParam("id") final String id) {
        List<Map<String, Object>> result;
        Connection conn = getConnection();
        if(id.equals("99")){
            List<Object> params = new ArrayList<>();
            result = executeQuery(conn, 67, null);
        }else{
            List<Object> params = new ArrayList<>();
            params.add(id);
            result = executeQuery(conn, 64, params);
        }
        
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/obtener_usuario")
    public List<Map<String, Object>> getUsuario(@QueryParam("id") final String id) {
        
        List<Map<String, Object>> result;
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(id);
        result = executeQuery(conn, 50, params);
        safeClose(conn);
        return result;
    }
    @GET
    @Path("/obtener_roles")
    public List<Map<String, Object>> getRoles() {
        
        List<Map<String, Object>> result;
        Connection conn = getConnection();
        result = executeQuery(conn, 51, null);
        safeClose(conn);
        return result;
    }
    @GET
    @Path("/obtener_rol")
    public List<Map<String, Object>> getRol(@QueryParam("rol") final String rol) {
        
        List<Map<String, Object>> result;
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(rol);
        result = executeQuery(conn, 52, params);
        safeClose(conn);
        return result;
    }
    
    @PUT
    @Path("/nuevo_usuario")
    public List<Map<String, Object>> createUsuario(Map<String, Object> mapacrear) {
        
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        int resultado = 0;
        
        try
        {
            Connection conn = getConnection();
            
            
            
            String nombre = (String) mapacrear.get("nombre");
            String usuario = (String) mapacrear.get("usuario");
            String password = (String) mapacrear.get("password");
            String rol = (String) mapacrear.get("rol");
            int activo = (int) mapacrear.get("activo");
            
            int userEmpresa = (int) mapacrear.get("userEmpresa");
            //int esAdmin = (int) mapacrear.get("esAdmin");
            
            List<Object> params = new ArrayList<>();
            params.add(usuario);
            params.add(password);
            params.add(rol);
            params.add(nombre);
            params.add(activo);
            params.add(userEmpresa);
            
            resultado = executeUpdate(conn, 53, params);
            commit(conn);
            safeClose(conn);
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", resultado);
            mapa.add(map1);
            
            return mapa;
        } catch (Exception e) {
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", 0);
            mapa.add(map1);
            return mapa;
        }
        
    }
    
    @POST
    @Path("/editar_usuario")
    public List<Map<String, Object>> updateUsuario(Map<String, Object> mapacrear) {
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        int resultado = 0;
        
        try
        {
            
            Connection conn = getConnection();
            String usuario = (String) mapacrear.get("usuario");
            String nombre = (String) mapacrear.get("nombre");
            String password = (String) mapacrear.get("password");
            String rol = (String) mapacrear.get("rol");
            Boolean activo = (Boolean) mapacrear.get("activo");
            int userempresa = (int) mapacrear.get("userempresa");
            int act = 0;
            act = activo ? 1 : 0;
            
            List<Object> params = new ArrayList<>();
            params.add(nombre);
            params.add(password);
            params.add(rol);
            params.add(act);
            params.add(userempresa);
            params.add(usuario);
            
            resultado = executeUpdate(conn, 54, params);
            commit(conn);
            safeClose(conn);
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", resultado);
            mapa.add(map1);
            
            return mapa;
        } catch (Exception e) {
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", 0);
            mapa.add(map1);
            return mapa;
        }
    }
    
    @PUT
    @Path("/rol_crear")
    public List<Map<String, Object>> createRol(Map<String, Object> mapacrear) {
        
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        int resultadoRol = 0;
        int resultadoPermiso = 0;
        
        try
        {
            Connection conn = getConnection();
            
            List<Map<String, Object>> nextidmap = executeQuery(conn, 61, null);
            BigDecimal idRol = (BigDecimal) nextidmap.get(0).get("NEXTID");
            
            //String idRol = (String) mapacrear.get("idRol");
            String nombreRol = (String) mapacrear.get("nombreRol");
            int empresa = (int) mapacrear.get("empresa");
            Boolean esAdmin = (Boolean) mapacrear.get("esAdmin");
            
            
            List<Object> params = new ArrayList<>();
            params.add(idRol);
            params.add(nombreRol);
            resultadoRol = executeUpdate(conn, 55, params);
            
            if(esAdmin){
                List<Object> paramsPermiso = new ArrayList<>();
                paramsPermiso.add(idRol);
                paramsPermiso.add(1);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                resultadoPermiso = executeUpdate(conn, 56, paramsPermiso);
            }else{
                //leer la grilla de permisos
                int verMensajes = (int) mapacrear.get("verMensajes");
                int edicionAT = (int) mapacrear.get("edicionAT");
                int edicionMTBT = (int) mapacrear.get("edicionMTBT");
                int validarIncidencias = (int) mapacrear.get("validarIncidencias");
                int reporteGrafico = (int) mapacrear.get("reporteGrafico");
                int adminpermusu = (int) mapacrear.get("adminpermusu");
                
                List<Object> paramsPermiso = new ArrayList<>();
                paramsPermiso.add(idRol);
                paramsPermiso.add(0);
                paramsPermiso.add(empresa);
                paramsPermiso.add(edicionAT);
                paramsPermiso.add(edicionMTBT);
                paramsPermiso.add(edicionMTBT);
                paramsPermiso.add(validarIncidencias);
                paramsPermiso.add(verMensajes);
                paramsPermiso.add(reporteGrafico);
                paramsPermiso.add(adminpermusu);
                resultadoPermiso = executeUpdate(conn, 56, paramsPermiso);
            }
            commit(conn);
            safeClose(conn);
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            int resultado = resultadoPermiso <= 0 || resultadoRol <= 0 ? 0 : 1;
            map1.put("resultado", resultado);
            mapa.add(map1);
            
            return mapa;
        } catch (Exception e) {
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", 0);
            mapa.add(map1);
            return mapa;
        }
        
    }
    
    @POST
    @Path("/rol_editar")
    public List<Map<String, Object>> updateRol(Map<String, Object> mapacrear) {
        
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        int resultadoRol = 0;
        int resultadoPermiso = 0;
        
        try
        {
            Connection conn = getConnection();
            
            
            
            String idRol = (String) mapacrear.get("idRol");
            String nombreRol = (String) mapacrear.get("nombreRol");
            Boolean esAdmin = (Boolean) mapacrear.get("esAdmin");
            
            
            List<Object> params = new ArrayList<>();
            params.add(nombreRol);
            params.add(idRol);
            resultadoRol = executeUpdate(conn, 57, params);
            
            if(esAdmin){
                List<Object> paramsPermiso = new ArrayList<>();
                paramsPermiso.add(1);
                //paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(0);
                paramsPermiso.add(idRol);
                resultadoPermiso = executeUpdate(conn, 58, paramsPermiso);
            }else{
                //leer la grilla de permisos
                int verMensajes = (int) mapacrear.get("verMensajes");
                int edicionAT = (int) mapacrear.get("edicionAT");
                int edicionMTBT = (int) mapacrear.get("edicionMTBT");
                int validarIncidencias = (int) mapacrear.get("validarIncidencias");
                int reporteGrafico = (int) mapacrear.get("reporteGrafico");
                int adminpermusu = (int) mapacrear.get("adminpermusu");
                //int empresa = (int) mapacrear.get("empresa");
                List<Object> paramsPermiso = new ArrayList<>();
                paramsPermiso.add(0);
                //paramsPermiso.add(empresa);
                paramsPermiso.add(edicionAT);
                paramsPermiso.add(edicionMTBT);
                paramsPermiso.add(edicionMTBT);
                paramsPermiso.add(validarIncidencias);
                paramsPermiso.add(verMensajes);
                paramsPermiso.add(reporteGrafico);
                paramsPermiso.add(adminpermusu);
                paramsPermiso.add(idRol);
                resultadoPermiso = executeUpdate(conn, 58, paramsPermiso);
            }
            commit(conn);
            safeClose(conn);
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            int resultado = resultadoPermiso <= 0 || resultadoRol <= 0 ? 0 : 1;
            map1.put("resultado", resultado);
            mapa.add(map1);
            
            return mapa;
        } catch (Exception e) {
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", 0);
            mapa.add(map1);
            return mapa;
        }
        
    }
    
    @GET
    @Path("/existe_perfil")
    public List<Map<String, Object>> existePerfil(@QueryParam("nombreRol") final String nombreRol) {
        
        List<Object> params = new ArrayList<>();
        Connection conn = getConnection();
        params.add(nombreRol);
        List<Map<String, Object>> result = executeQuery(conn, 62, params);
        safeClose(conn);
        return result;
    }
    
    @GET
    @Path("/empresa_user")
    public List<Map<String, Object>> empresaUser(@QueryParam("username") final String username) {
        List<Object> params = new ArrayList<>();
        Connection conn = getConnection();
        params.add(username);
        List<Map<String, Object>> result = executeQuery(conn, 63, params);
        safeClose(conn);
        return result;
    }
    
    @POST
    @Path("/detalle_reporte_filtros")
    public List<Map<String, Object>> getDetalleReporteFiltros(Map<String, Object> param) {
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        try{
            String fechaInicio = (String) param.get("fechaInicio");
            String fechaHasta = (String) param.get("fechaHasta");
            int empresa = (int) param.get("empresa");
            Connection conn = getConnection();
            List<Map<String, Object>> result;
            
            if(empresa == 1){ // todos
                List<Object> params = new ArrayList<>();
                params.add(fechaInicio);
                params.add(fechaHasta);
//                params.add(fechaInicio);
//                params.add(fechaHasta);
                result = executeQuery(conn, 65, params);
            } else{
                List<Object> params = new ArrayList<>();
                params.add(fechaInicio);
                params.add(fechaHasta);
                params.add(empresa);
//                params.add(fechaInicio);
//                params.add(fechaHasta);
//                params.add(empresa);
                result = executeQuery(conn, 66, params);
            }
            safeClose(conn);
            return result;
        } catch (Exception e) {
            
            Map<String, Object> map1 = new HashMap<String, Object>();
            map1.put("resultado", 0);
            mapa.add(map1);
            return mapa;
        }
        
    }
    
    @GET
    @Path("/existe_usuario")
    public List<Map<String, Object>> existeUsuario(@QueryParam("username") final String username) {
        List<Object> params = new ArrayList<>();
        Connection conn = getConnection();
        params.add(username);
        List<Map<String, Object>> result = executeQuery(conn, 69, params);
        safeClose(conn);
        return result;
    }
    
    @PUT
    @Path("/reingresa_usuario")
    public List<Map<String, Object>> reingresaUsuario(Map<String, Object> payload) {
        List<Object> params = new ArrayList<>();
        Connection conn = getConnection();
        
        String username = (String) payload.get("username");
        int activo = (int) payload.get("activo");
        String password = (String) payload.get("password");
        String role = (String) payload.get("role");
        int userempresa = (int) payload.get("userempresa");
        String nombre = (String) payload.get("nombre");
        
        String usuariomodifica = (String) payload.get("usuariomodifica");
        
        params.add(username);
        params.add(activo);
        params.add(password);
        params.add(role);
        params.add(userempresa);
        params.add(usuariomodifica);
        params.add(nombre);
        
        List<Map<String, Object>> mapa = new ArrayList<Map<String, Object>>();
        int result = executeUpdate(conn, 70, params);
        Map<String, Object> map1 = new HashMap<String, Object>();
        map1.put("resultado", result);
        mapa.add(map1);
        
        commit(conn);
        safeClose(conn);
        return mapa;
    }
    
    @GET
    @Path("/value_parametro")
    public List<Map<String, Object>> getParametroByValue(@QueryParam("id_parametro") final String idParametro) {
        
        List<Object> params = new ArrayList<>();
        Connection conn = getConnection();
        params.add(idParametro);
        List<Map<String, Object>> result = executeQuery(conn, 72, params);
        safeClose(conn);
        return result;
    }
    @GET
    @Path("/correos_proceso")
    public List<Map<String, Object>> getCorreosProceso() {
        
        Connection conn = getConnection();
        List<Map<String, Object>> result = executeQuery(conn, 74, null);
        safeClose(conn);
        return result;
    }
    
    @DELETE
    @Path("/elimina_correos")
    public void eliminaCorreos(@QueryParam("idCorreo") final String idCorreo) {

        Connection conn = getConnection();
   
        List<Object> params = new ArrayList<>();
        params.add(idCorreo);
        executeUpdate(conn, 76, params);
        
//        for (Map<String, Object> map : payload) {
//            for (Map.Entry<String, Object> entry : map.entrySet()) {
//                String idCorreo = entry.getKey();
//                List<Object> params = new ArrayList<>();
//                params.add(idCorreo);
//                executeUpdate(conn, 76, params);
//            }
//        }
//        for (Map.Entry<String, Object> entry : payload.entrySet())
//        {
//            String idCorreo = entry.getKey();
//            List<Object> params = new ArrayList<>();
//            params.add(idCorreo);
//            executeUpdate(conn, 76, params);
//        }
        commit(conn);
        safeClose(conn);
    }
    
    @PUT
    @Path("/agrega_correos")
    public void agregaCorreos(Map<String, Object> payload) {

        Connection conn = getConnection();
        
        List<Map<String, Object>> nextidmap = executeQuery(conn, 77, null);
        BigDecimal id = (BigDecimal) nextidmap.get(0).get("NEXTID");
        
        String correo = (String) payload.get("CORREO");
        
        List<Object> params = new ArrayList<>();
        params.add(id);
        params.add(correo);
        executeUpdate(conn, 75, params);
        commit(conn);
        
        safeClose(conn);
    }
    
    @PUT
    @Path("/value_parametro")
    public void setParametroByValue(@QueryParam("id_parametro") final String idParametro, @QueryParam("valor") final String valor) {

        Connection conn = getConnection();
 
        List<Object> params = new ArrayList<>();
        params.add(valor);
        params.add(idParametro);
        executeUpdate(conn, 73, params);
        commit(conn);
        
        safeClose(conn);
    }
    @GET
    @Path("/incidenciasSec")
    public List<Map<String, Object>> getIncidenciasSec() {
        List<Map<String, Object>> result ;
        try {
        String date = "sysdate";
        Connection conn = getConnection();
        List<Object> params = new ArrayList<>();
        params.add(date);
        result = executeQuery(conn, 78, params);
            if (result != null) {
                result = executeQuery(conn, 79, null);
            }       
        safeClose(conn);
        return result;
        }catch(Exception ex)
        {
            result = null;
            return result;
        }
    }
//    @GET
//    @Path("/grafico_saidi")
//    public List<Map<String, Object>> getGrafico_Saidi(@QueryParam("filtro") final String filtro) {
//        Connection conn = getConnection();
//        List<Object> params = new ArrayList<>();
//        List<Map<String, Object>> result;
//        try
//        {
//             params.add(filtro);
//             result = executeQuery(conn, 99, params);
//            safeClose(conn);
//        }catch(Exception ex)
//        {
//            result = null;
//            return result;
//        }
//       
//        return result;
//    }
    
}
