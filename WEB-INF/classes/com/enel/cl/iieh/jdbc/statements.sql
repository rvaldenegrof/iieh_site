[0]
SELECT COM.*
FROM (
	SELECT SYSDATE 
	FROM DUAL 
	WHERE ROWNUM BETWEEN NVL(?,1) AND NVL(?, 5000)
) COM WHERE COM."_ROWNUM" BETWEEN NVL(?,1) AND NVL(?, 5000)
[1]
SELECT COM.ICOM_ID, COM.ICOM_COMUNA, COM.ICOM_NOMBRE, COM.ICOM_DIVGEO 
FROM (
    SELECT ROWNUM "_ROWNUM", ICOM_ID, ICOM_COMUNA, ICOM_NOMBRE, ICOM_DIVGEO 
    FROM IIEH_COMUNAS
) COM WHERE COM."_ROWNUM" BETWEEN NVL(?,1) AND NVL(?, 5000)
[2]
SELECT IEMP_CODIGOPROCESO, IEMP_CODIGOSEC, IEMP_ID, IEMP_NOMBRE 
FROM (
	SELECT ROWNUM "_ROWNUM", IEMP_CODIGOPROCESO, IEMP_CODIGOSEC, IEMP_ID, IEMP_NOMBRE 
	FROM IIEH_EMPRESAS
) COM WHERE COM."_ROWNUM" BETWEEN NVL(?,1) AND NVL(?, 5000)
[3]
SELECT 
    COM.ICAB_ID, 
    COM.ICAB_FECHAMENSAJE, 
    COM.ICAB_CANTIDADREGISTROS, 
    COM.IEMP_NOMBRE, 
    COM.ICAB_CODIGOSEC, 
    COM.ICAB_CODIGOPROCESO, 
    COM.ICAB_USUMODIFICA, 
    COM.ICAB_FECHAMODIF, 
    COUNT(COM.IENV_ID) IENV_COUNT,
    SUM(COM.CANTIDADCLIENTESAFECTADOS) CANTIDADCLIENTESAFECTADOS
FROM (
    SELECT 
        ROWNUM "_ROWNUM",
        ICAB_ID, 
        TO_CHAR(ICAB_FECHAMENSAJE,'YYYY-MM-DD HH24:MI:SS') ICAB_FECHAMENSAJE, 
        ICAB_CANTIDADREGISTROS, 
        IEMP.IEMP_NOMBRE, 
        ICAB_CODIGOSEC, 
        ICAB_CODIGOPROCESO, 
        ICAB_USUMODIFICA, 
        TO_CHAR(ICAB_FECHAMODIF,'YYYY-MM-DD HH24:MI:SS') ICAB_FECHAMODIF, 
        IENV.IENV_ID,
        NVL(IDET.IDET_CANTIDADCLIENTESAFECTADOS,0) CANTIDADCLIENTESAFECTADOS
    FROM IIEH_MENSAJES ICAB 
        INNER JOIN IIEH_EMPRESAS IEMP ON ICAB.ICAB_IEMP_ID = IEMP.IEMP_ID
        LEFT OUTER JOIN IIEH_MENSAJES_ENVIOS IENV ON ICAB.ICAB_ID = IENV.IENV_ICAB_ID
        LEFT OUTER JOIN IIEH_MENSAJES_DETALLES IDET ON IDET.IDET_ICAB_ID = ICAB.ICAB_ID
        WHERE ICAB_FECHAMENSAJE >=TRUNC(SYSDATE-7)
--    WHERE 
--            ((ICAB_ID = ?) OR (? IS NULL))
--        AND ((IEMP_ID = ?) OR (? IS NULL))
--        AND ((ICAB_FECHAMENSAJE BETWEEN ? AND ?) OR (? IS NULL) OR (? IS NULL))
--        AND ((ICAB_USUMODIFICA = ?) OR (? IS NULL))
    ORDER BY 
        ICAB_FECHAMENSAJE DESC
) COM 
--WHERE 
--    COM."_ROWNUM" BETWEEN NVL(?,1) AND NVL(?, 5000)
GROUP BY 
        COM.ICAB_ID, 
        COM.ICAB_FECHAMENSAJE, 
        COM.ICAB_CANTIDADREGISTROS, 
        COM.IEMP_NOMBRE, 
        COM.ICAB_CODIGOSEC, 
        COM.ICAB_CODIGOPROCESO, 
        COM.ICAB_USUMODIFICA, 
        COM.ICAB_FECHAMODIF
ORDER BY 
        COM.ICAB_FECHAMENSAJE DESC
[4]
SELECT 
        COM.IDET_ID,
        COM.IDET_NUMEROINFORME,
        COM.IDET_FECHAHORAINFORME,
        COM.IDET_REGION,
        COM.IDET_COMUNA,
        COM.IDET_CANTIDADCLIENTESAFECTADOS,
        COM.IDET_ICAB_ID,
        COM.IDET_USUMODIFICA,
        COM.IDET_FECHAMODIF,
        COM.IDET_CONCESIONARIA,
        COM.IDET_FECHAINTERRUPCION,
        COM.IDET_SUBESTACION,
        COM.IDET_ALIMENTADOR,
        COM.IDET_TIEMPOINTERRUMPIDO,
        COM.IDET_CANTIDADCLIENTEINICIALES,
        COM.IDET_CUADRILLASLIVIANAS,
        COM.IDET_CUADRILLASPESADAS,
        COM.IDET_TIEMPOESTIMADOREPOSICION,
        COM.IDET_FECHATERMINOINTERRUPCION,
        COM.IDET_NODOOPERADO,
        COM.IDET_NUMEROINTERRUPCION
FROM (
    SELECT 
        ROWNUM "_ROWNUM", 
        IDET_ID,
        IDET_NUMEROINFORME,
        TO_CHAR(IDET_FECHAHORAINFORME,'YYYY-MM-DD HH24:MI:SS') IDET_FECHAHORAINFORME, 
        IDET_REGION,
        IDET_COMUNA,
        IDET_CANTIDADCLIENTESAFECTADOS,
        IDET_ICAB_ID,
        IDET_USUMODIFICA,
        TO_CHAR(IDET_FECHAMODIF,'YYYY-MM-DD HH24:MI:SS') IDET_FECHAMODIF,
        IDET_CONCESIONARIA,
        TO_CHAR(IDET_FECHAINTERRUPCION,'YYYY-MM-DD HH24:MI:SS') IDET_FECHAINTERRUPCION,
        IDET_SUBESTACION,
        IDET_ALIMENTADOR,
        IDET_TIEMPOINTERRUMPIDO,
        IDET_CANTIDADCLIENTEINICIALES,
        IDET_CUADRILLASLIVIANAS,
        IDET_CUADRILLASPESADAS,
        IDET_TIEMPOESTIMADOREPOSICION,
        TO_CHAR(IDET_FECHATERMINOINTERRUPCION,'YYYY-MM-DD HH24:MI:SS') IDET_FECHATERMINOINTERRUPCION,
        IDET_NODOOPERADO,
        IDET_NUMEROINTERRUPCION
    FROM 
        IIEH_MENSAJES_DETALLES IDET 
    WHERE 
        IDET.IDET_ICAB_ID = ?
) COM WHERE COM."_ROWNUM" BETWEEN NVL(?,1) AND NVL(?, 5000)
[5]
SELECT 
        COM.IENV_ICAB_ID,
        COM.IENV_ID,
        COM.IENV_FECHAINFORME,
        COM.IENV_EJECUTADO,
        COM.IENV_ERRONEO,
        COM.IENV_FECHAHORALOG,
        COM.IENV_USUMODIFICA,
        COM.IENV_FECHAMODIF,
        COM.IRES_JSONENVIO,
        COM.IRES_JSONRESP
FROM (
    SELECT 
        ROWNUM "_ROWNUM", 
        IENV.IENV_ICAB_ID,
        IENV.IENV_ID,
        TO_CHAR(IENV.IENV_FECHAINFORME,'YYYY-MM-DD HH24:MI:SS') IENV_FECHAINFORME,
        IENV.IENV_EJECUTADO,
        IENV.IENV_ERRONEO,
        TO_CHAR(IENV.IENV_FECHAHORALOG,'YYYY-MM-DD HH24:MI:SS') IENV_FECHAHORALOG,
        IENV.IENV_USUMODIFICA,
        IENV.IENV_FECHAMODIF,
        IRES.IRES_JSONENVIO,
        IRES.IRES_JSONRESP
    FROM 
        IIEH_MENSAJES_ENVIOS IENV 
        LEFT OUTER JOIN IIEH_RESPUESTASEC IRES ON IRES.IRES_ID = IENV.IENV_ID
    WHERE IENV_ICAB_ID = ?
) COM WHERE COM."_ROWNUM" BETWEEN NVL(?,1) AND NVL(?, 5000)
[6]
SELECT 
    ABS(NUMEROINTERRUPCION) NUMEROINTERRUPCION, 
    TO_CHAR(FECHAINTERRUPCION,' HH24:MI:SS DD-MM-YYYY') FECHAINTERRUPCION, 
    TO_CHAR(FECHATERMINOINTERRUPCION,' HH24:MI:SS DD-MM-YYYY') FECHATERMINOINTERRUPCION,
    DESCRIPCION,
    CANT_COMUNAS, 
    CANT_CLI,
    USUARIOCREA,
    USUARIOMODIFICA,
    TO_CHAR(FECHACREA,'HH24:MI:SS DD-MM-YYYY') FECHACREA,
    TO_CHAR(FECHAMODIFICA,'HH24:MI:SS DD-MM-YYYY') FECHAMODIFICA
FROM 
    IIEH_INCIDENCIASAT  IIAT
WHERE 
    FECHATERMINOINTERRUPCION IS NULL 
ORDER BY IIAT.FECHAINTERRUPCION DESC
[7]
SELECT 
    LINEA, 
    CTO,
    BARRA,
    BF,
    SDAC,
    CE,
    SUBESTACION,
    ALIMENTADOR,
    ID_COMUNA_SEC,
    ICOM_NOMBRE,
    CANT_CLI,
    (TO_CHAR(SYSDATE + (IITE_TIEMPOREPOSICION/24)  ,'DD-MM-YYYY HH24:MI:SS')) AS FECHA_ESTIMADA_REPOSICION,
	ROWNUM NUM
     
FROM 
    (VM_AT INNER JOIN IIEH_COMUNAS ON ICOM_COMUNA = ID_COMUNA_SEC) INNER JOIN IIEH_TEN ON IITE_COMUNA_ID = ID_COMUNA_SEC
[8]
SELECT SEQ_AT_ID.NEXTVAL NEXTID FROM DUAL
[9]
INSERT INTO IIEH_INCIDENCIASAT (NUMEROINTERRUPCION,FECHAINTERRUPCION,FECHATERMINOINTERRUPCION,CANT_COMUNAS,CANT_CLI,USUARIOCREA,FECHACREA,DESCRIPCION, TIPOINCIDENCIA, EMPRESA) VALUES (?,?,NULL,0,0,?,CURRENT_DATE,?,?,?)
[10]
INSERT INTO IIEH_INCIDENCIASAT_DET (NUMEROINTERRUPCION,FECHAINTERRUPCION,FECHATERMINOINTERRUPCION,LINEA,CTO,BARRA,BF,SDAC,CE,SUBESTACION,ALIMENTADOR,ID_COMUNA_SEC,CANT_CLI,SEQDET,USUARIOCREA,FECHACREA,FECHAESTIMADAREPOSICION) VALUES (?,?,NULL,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_DATE,?)
[11]
UPDATE IIEH_INCIDENCIASAT_DET SET FECHATERMINOINTERRUPCION = ?, USUARIOMODIFICA = ?, FECHAMODIFICA = CURRENT_DATE, CANT_CLI = ? , FECHAESTIMADAREPOSICION = ? WHERE NUMEROINTERRUPCION = ? AND SEQDET = ?
[12]
UPDATE 
    IIEH_INCIDENCIASAT 
SET 
    CANT_COMUNAS = (SELECT COUNT(DISTINCT ID_COMUNA_SEC) FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION = ?), 
    CANT_CLI = ( SELECT SUM(CANT_CLI) FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION = ?),
    USUARIOMODIFICA = ?, 
    FECHAMODIFICA = CURRENT_DATE
WHERE 
    NUMEROINTERRUPCION = ?
[13]
DELETE FROM IIEH_INCIDENCIASAT_DET WHERE NUMEROINTERRUPCION = ? AND SEQDET = ?
[14]
UPDATE
    IIEH_INCIDENCIASAT 
SET 
    FECHATERMINOINTERRUPCION = ?,
    USUARIOMODIFICA = ?, 
    FECHAMODIFICA = CURRENT_DATE
WHERE 
    NUMEROINTERRUPCION = ?
    AND (
    SELECT 
        COUNT(1) 
    FROM 
        IIEH_INCIDENCIASAT_DET 
    WHERE 
        FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION = ?
    ) = 0
[15]
SELECT DISTINCT ALIMENTADOR FROM VM_AT
[16]
SELECT SUM(CANT_CLI) TOTCLI FROM VM_AT
[17]
SELECT DISTINCT ICOM_COMUNA, ICOM_NOMBRE, ICOM_DIVGEO  FROM VM_AT INNER JOIN IIEH_COMUNAS ON ICOM_COMUNA = ID_COMUNA_SEC
[18]
SELECT 
    NUMEROINTERRUPCION,
    TO_CHAR(FECHAINTERRUPCION,'HH24:MI:SS DD-MM-YYYY') FECHAINTERRUPCION,
    TO_CHAR(FECHATERMINOINTERRUPCION,'HH24:MI:SS DD-MM-YYYY') FECHATERMINOINTERRUPCION,
    LINEA,
    CTO,
    BARRA,
    BF,
    SDAC,
    CE,
    SUBESTACION,
    ALIMENTADOR,
    ID_COMUNA_SEC,
    ICOM_NOMBRE,
    CANT_CLI,
    SEQDET,
    USUARIOCREA,
	USUARIOMODIFICA,
    TO_CHAR(FECHACREA,'HH24:MI:SS DD-MM-YYYY') FECHACREA,
    TO_CHAR(FECHAMODIFICA,'HH24:MI:SS DD-MM-YYYY') FECHAMODIFICA,
    TO_CHAR(FECHAESTIMADAREPOSICION,'DD-MM-YYYY HH24:MI:SS') FECHAESTIMADAREPOSICION
FROM 
    IIEH_INCIDENCIASAT_DET INNER JOIN IIEH_COMUNAS ON ICOM_COMUNA = ID_COMUNA_SEC
WHERE
    FECHATERMINOINTERRUPCION IS NULL
    AND NUMEROINTERRUPCION = ?
    AND CANT_CLI > 0
[19]
SELECT 'DESCRIPCION' CKEY, DESCRIPCION CVALUE FROM IIEH_INCIDENCIASAT WHERE NUMEROINTERRUPCION = ?
UNION ALL   
SELECT 'LASTFECHATERMINOINTERRUPCION' CKEY, TO_CHAR(MAX(IDET.FECHATERMINOINTERRUPCION), 'HH24:MI:SS DD-MM-YYYY') CVALUE  FROM IIEH_INCIDENCIASAT_DET IDET WHERE IDET.NUMEROINTERRUPCION = ?
UNION ALL   
SELECT 'NUMCOMUNAS' CKEY, TO_CHAR(COUNT(DISTINCT ID_COMUNA_SEC)) CVALUE FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION = ?
UNION ALL
SELECT 'NUMCLIENTE' CKEY, TO_CHAR(SUM(CANT_CLI)) CVALUE FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION = ?
UNION ALL
SELECT 'NUMALIMENTADORES' CKEY, TO_CHAR(COUNT(DISTINCT ALIMENTADOR)) CVALUE FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION = ?
UNION ALL
SELECT 'TOTCOMUNAS' CKEY, TO_CHAR(COUNT(DISTINCT ID_COMUNA_SEC)) CVALUE FROM VM_AT 
UNION ALL
SELECT 'TOTCLIENTE' CKEY, TO_CHAR(SUM(CANT_CLI)) CVALUE  FROM VM_AT 
UNION ALL
SELECT 'TOTALIMENTADORES' CKEY, TO_CHAR(COUNT(DISTINCT ALIMENTADOR)) CVALUE FROM VM_AT
[20]
SELECT * FROM (
SELECT DISTINCT
    ID_COMUNA_SEC, ICOM_NOMBRE, 1 EVAL
FROM 
    VM_AT INNER JOIN IIEH_COMUNAS ON ICOM_COMUNA = ID_COMUNA_SEC 
WHERE 
    ID_COMUNA_SEC IN (SELECT DISTINCT ID_COMUNA_SEC FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION  = ?)
UNION ALL
SELECT DISTINCT
    ID_COMUNA_SEC, ICOM_NOMBRE, 0 EVAL
FROM 
    VM_AT INNER JOIN IIEH_COMUNAS ON ICOM_COMUNA = ID_COMUNA_SEC 
WHERE 
    ID_COMUNA_SEC NOT IN (SELECT DISTINCT ID_COMUNA_SEC FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION = ?)
)
ORDER BY ID_COMUNA_SEC
[21]
SELECT TO_CHAR(CURRENT_DATE ,' HH24:MI:SS DD-MM-YYYY') CURDATE FROM DUAL
[22]
SELECT 
	U.USERNAME USERNAME, 
	U.NOMBRE NOMBRE, 
	R.NOMBRE ROL,
        R.APELLIDO
FROM 
	IIEH_ROLE R INNER JOIN IIEH_USERS U ON R.ROLE = U.ROLE 
WHERE U.USERNAME =?
[23]
SELECT 
    TO_CHAR(IDEC.FECHAINTERRUPCION,' HH24:MI:SS DD-MM-YYYY') FECHAINTERRUPCION, 
    TO_CHAR(IDEC.FECHATERMINOINTERRUPCION,' HH24:MI:SS DD-MM-YYYY') FECHATERMINOINTERRUPCION,
    IDEC.DESCRIPCION,
    IDEC.CANT_COMUNAS, 
    IDEC.CANT_CLI,
    IDEC.USUARIOCREA,
    IDEC.USUARIOMODIFICA,
    TO_CHAR(IDEC.FECHACREA,'HH24:MI:SS DD-MM-YYYY') FECHACREA,
    TO_CHAR(IDEC.FECHAMODIFICA,'HH24:MI:SS DD-MM-YYYY') FECHAMODIFICA
FROM 
    IIEH_INCIDENCIASAT IDEC 
WHERE 
    IDEC.NUMEROINTERRUPCION = ? 
[24]
SELECT 
    COM.ICAB_ID, 
    COM.ICAB_FECHAMENSAJE, 
    COM.ICAB_CANTIDADREGISTROS, 
    COM.IEMP_NOMBRE, 
    COM.ICAB_CODIGOSEC, 
    COM.ICAB_CODIGOPROCESO, 
    COM.ICAB_USUMODIFICA, 
    COM.ICAB_FECHAMODIF, 
    COUNT(COM.IENV_ID) IENV_COUNT,
    SUM(COM.CANTIDADCLIENTESAFECTADOS) CANTIDADCLIENTESAFECTADOS
FROM (
    SELECT 
        ROWNUM "_ROWNUM",
        ICAB_ID, 
        TO_CHAR(ICAB_FECHAMENSAJE,'YYYY-MM-DD HH24:MI:SS') ICAB_FECHAMENSAJE, 
        ICAB_CANTIDADREGISTROS, 
        IEMP.IEMP_NOMBRE, 
        ICAB_CODIGOSEC, 
        ICAB_CODIGOPROCESO, 
        ICAB_USUMODIFICA, 
        TO_CHAR(ICAB_FECHAMODIF,'YYYY-MM-DD HH24:MI:SS') ICAB_FECHAMODIF, 
        IENV.IENV_ID,
        NVL(IDET.IDET_CANTIDADCLIENTESAFECTADOS,0) CANTIDADCLIENTESAFECTADOS
    FROM IIEH_MENSAJES ICAB 
        INNER JOIN IIEH_EMPRESAS IEMP ON ICAB.ICAB_IEMP_ID = IEMP.IEMP_ID
        LEFT OUTER JOIN IIEH_MENSAJES_ENVIOS IENV ON ICAB.ICAB_ID = IENV.IENV_ICAB_ID
        LEFT OUTER JOIN IIEH_MENSAJES_DETALLES IDET ON IDET.IDET_ICAB_ID = ICAB.ICAB_ID
    WHERE 
		((ICAB_ID = ?) OR (? IS NULL))
    ORDER BY 
        ICAB_FECHAMENSAJE DESC
) COM 
GROUP BY 
        COM.ICAB_ID, 
        COM.ICAB_FECHAMENSAJE, 
        COM.ICAB_CANTIDADREGISTROS, 
        COM.IEMP_NOMBRE, 
        COM.ICAB_CODIGOSEC, 
        COM.ICAB_CODIGOPROCESO, 
        COM.ICAB_USUMODIFICA, 
        COM.ICAB_FECHAMODIF
ORDER BY 
        COM.ICAB_FECHAMENSAJE DESC	
[25]
SELECT
	IALIM.CONCESIONARIO,
	IALIM.SUBESTACION,
	IALIM.ALIMENTADOR,
	IALIM.ALIMENTADOR_ID,
	IALIM.NODO_OPERADO,
	IALIM.COMUNA_CABECERA_ID,
	IALIM.COMUNA_CABECERA,
	IALIM.COMUNA_ID,
	IALIM.COMUNA,
	IALIM.CLIENTES
FROM 
	IIEH_ALIMENTADORES IALIM
WHERE 
	IALIM.CONCESIONARIO = ?
[26]
SELECT SEQ_ID.NEXTVAL NEXTID from dual
[27]
INSERT INTO IIEH_MENSAJES (ICAB_ID, ICAB_FECHAMENSAJE,ICAB_CANTIDADREGISTROS,ICAB_IEMP_ID,ICAB_CODIGOSEC,ICAB_CODIGOPROCESO,ICAB_USUMODIFICA,ICAB_FECHAMODIF) VALUES (?,TO_DATE(?, 'YYYY-MM-DD HH24:MI:SS'),?,?,?,?,?,TO_DATE(?, 'YYYY-MM-DD HH24:MI:SS'))
[28]
INSERT INTO IIEH_MENSAJES_DETALLES (IDET_ID,IDET_NUMEROINFORME,IDET_FECHAHORAINFORME,IDET_REGION,IDET_COMUNA,
	IDET_CANTIDADCLIENTESAFECTADOS,IDET_ICAB_ID,
	IDET_USUMODIFICA,IDET_FECHAMODIF,IDET_CONCESIONARIA,IDET_FECHAINTERRUPCION,IDET_SUBESTACION,
	IDET_ALIMENTADOR,IDET_TIEMPOINTERRUMPIDO,IDET_CANTIDADCLIENTEINICIALES,IDET_CUADRILLASLIVIANAS,
	IDET_CUADRILLASPESADAS, IDET_TIEMPOESTIMADOREPOSICION, IDET_FECHATERMINOINTERRUPCION,
	IDET_NODOOPERADO,IDET_NUMEROINTERRUPCION) 
VALUES (?,?,TO_DATE(?, 'YYYY-MM-DD HH24:MI:SS'),?,?,?,?,?,TO_DATE(?, 'YYYY-MM-DD HH24:MI:SS'),?,TO_DATE(?, 'YYYY-MM-DD HH24:MI:SS'),?,?,?,?,?,?,?,TO_DATE(?, 'YYYY-MM-DD HH24:MI:SS'),?,?)
[29]
select count(1) EXISTE from IIEH_MENSAJES_DETALLES where  to_char(IDET_NUMEROINTERRUPCION) like ?
[30]
SELECT SEQ_ID.NEXTVAL NEXTID from dual
[31]
SELECT SEQ_INF_ID.NEXTVAL NEXTID from dual
[32]
select msjs.ICAB_ID, TO_CHAR(msjs.icab_fechamensaje, 'DD-MM-YYYY HH24:MI:SS') icab_fechamensaje, count(distinct msjs_det.idet_comuna) as cant_comunas,
sum(msjs_det.idet_cantidadclientesafectados) as cant_clientes
FROM iieh_mensajes_paso msjs
inner join iieh_mensajes_detalles msjs_det
on msjs.icab_id = msjs_det.idet_icab_id
group by msjs.icab_id,  msjs.icab_fechamensaje
[33]
SELECT 
    TO_CHAR(IDET_FECHAHORAINFORME, 'YYYY-MM-DD HH24:MI:SS') AS HORA_INFORME,
    TO_CHAR(IDET_FECHAINTERRUPCION, 'YYYY-MM-DD HH24:MI:SS') AS HORA_INTERRUPCION,
    TO_CHAR(IDET_FECHATERMINOINTERRUPCION, 'YYYY-MM-DD HH24:MI:SS') AS HORA_TERMINO_INTERRUPCION,
    CASE WHEN EMP.IEMP_NOMBRE = 'LOS ANDES' THEN 'LUZ ANDES' ELSE EMP.IEMP_NOMBRE END AS EMPRESA,
    COM.ICOM_NOMBRE AS COMUNA,
    DET.IDET_CANTIDADCLIENTESAFECTADOS AS CLIENTES_AFECTADOS,
    DET.IDET_ALIMENTADOR AS ALIMENTADOR,
    FLOOR((round(to_number(
    CASE WHEN TO_CHAR(DET.IDET_FECHATERMINOINTERRUPCION, 'YYYY-MM-DD HH24:MI:SS') = '1900-01-01 00:00:00' THEN SYSDATE ELSE DET.IDET_FECHATERMINOINTERRUPCION END
    - IDET_FECHAINTERRUPCION) * 24 * 60) / 60) *100)/100 AS DURACION,
    DET.IDET_NUMEROINTERRUPCION  AS NUMERO_INTERRUPCION,
    CONCAT(DET.IDET_ALIMENTADOR, DET.IDET_NUMEROINTERRUPCION) AS GRUPO
FROM IIEH_MENSAJES_DETALLES_PASO DET
    INNER JOIN IIEH_EMPRESAS EMP
    ON EMP.IEMP_CODIGOSEC = DET.IDET_CONCESIONARIA
    INNER JOIN IIEH_COMUNAS COM
    ON COM.ICOM_COMUNA = DET.IDET_COMUNA
WHERE NVL(DET.IDET_ENVIADO, 0) != 1 AND NVL(DET.IDET_CERRADO, 0) = 0
AND DET.IDET_CANTIDADCLIENTESAFECTADOS > 0 AND TO_CHAR(DET.IDET_FECHATERMINOINTERRUPCION, 'YYYY-MM-DD HH24:MI:SS') = '1900-01-01 00:00:00'
ORDER BY CLIENTES_AFECTADOS desc
[34]
UPDATE iieh_mensajes_detalles_paso
    SET IDET_FECHATERMINOINTERRUPCION = TO_DATE(?, 'YYYY-MM-DD HH24:MI:SS'),
        IDET_CANTIDADCLIENTESAFECTADOS = ?,
        IDET_CERRADO = ?,
        IDET_USUCIERRE = ?
WHERE IDET_ALIMENTADOR = ?
    AND TO_CHAR(IDET_NUMEROINTERRUPCION) LIKE  CONCAT(?,'%')
[35]
SELECT * FROM iieh_mensajes_detalles_paso
WHERE IDET_ALIMENTADOR = ?
    AND TO_CHAR(IDET_NUMEROINTERRUPCION) LIKE  CONCAT(?,'%')
[36]
UPDATE iieh_mensajes_paso
    SET ICAB_CERRADO = ?,
        ICAB_USUCIERRE = ?
WHERE ICAB_ID = ?
[37]
SELECT 0 as LINEA, 0 as CTO, 0 as BARRA, 0 as BF, 0 as SDAC, 0 as CE,
        SUBESTACION, UPPER(ALIMENTADOR) as ALIMENTADOR, ALIMENTADOR_ID, UPPER(COMUNA_CABECERA) as ICOM_NOMBRE, 
        COMUNA_ID, CLIENTES as CANT_CLI , '' as FECHA_ESTIMADA_REPOSICION , ROWNUM NUM
    FROM IIEH_ALIMENTADORES
WHERE CONCESIONARIO = ?
[38]
SELECT DISTINCT ALIMENTADOR FROM IIEH_ALIMENTADORES 
WHERE CONCESIONARIO = ?
[39]
SELECT SUM(CLIENTES) TOTCLI FROM IIEH_ALIMENTADORES
WHERE CONCESIONARIO = ?
[40]
SELECT DISTINCT COMUNA_ID ICOM_COMUNA,  UPPER(COMUNA_CABECERA) ICOM_NOMBRE, 0 ICOM_DIVGEO  
FROM IIEH_ALIMENTADORES
WHERE CONCESIONARIO = ?
[41]
    Select Case When Empresa = 0 Then 10 Else Empresa End Empresa,
          NVL(TO_NUMBER(TipoIncidencia),0) TipoIncidencia FROM
          (Select Cabecera.Empresa, Cabecera.Tipoincidencia 
          From Iieh_Incidenciasat Cabecera
          Inner Join Iieh_Incidenciasat_Det Detalles
          on Detalles.NumeroInterrupcion = Cabecera.NumeroInterrupcion
          Where Detalles.Numerointerrupcion = ?
          Union All Select 0, '0' From Dual) D
          WHERE ROWNUM = 1
[42]
    SELECT 'DESCRIPCION' CKEY, DESCRIPCION CVALUE FROM IIEH_INCIDENCIASAT WHERE NUMEROINTERRUPCION = ?
    UNION ALL   
    SELECT 'LASTFECHATERMINOINTERRUPCION' CKEY, TO_CHAR(MAX(IDET.FECHATERMINOINTERRUPCION), 'HH24:MI:SS DD-MM-YYYY') CVALUE  FROM IIEH_INCIDENCIASAT_DET IDET WHERE IDET.NUMEROINTERRUPCION =  ?
    UNION ALL   
    SELECT 'NUMCOMUNAS' CKEY, TO_CHAR(COUNT(DISTINCT ALIM.COMUNA_ID)) CVALUE 
    FROM IIEH_ALIMENTADORES ALIM
    INNER JOIN IIEH_INCIDENCIASAT_DET INCIDET
    ON ALIM.ALIMENTADOR = INCIDET.ALIMENTADOR
    WHERE INCIDET.NUMEROINTERRUPCION = ?
    UNION ALL
    SELECT 'NUMCLIENTE' CKEY, TO_CHAR(SUM(CANT_CLI)) CVALUE FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION =  ?
    UNION ALL
    SELECT 'NUMALIMENTADORES' CKEY, TO_CHAR(COUNT(DISTINCT ALIMENTADOR)) CVALUE FROM IIEH_INCIDENCIASAT_DET WHERE FECHATERMINOINTERRUPCION IS NULL AND NUMEROINTERRUPCION =  ?
    UNION ALL
    SELECT 'TOTCOMUNAS' CKEY, TO_CHAR(COUNT(DISTINCT ALIM.COMUNA_ID)) CVALUE 
    FROM IIEH_ALIMENTADORES ALIM
    INNER JOIN IIEH_INCIDENCIASAT_DET INCIDET
    ON ALIM.ALIMENTADOR = INCIDET.ALIMENTADOR
    WHERE INCIDET.NUMEROINTERRUPCION = ?
    UNION ALL
    SELECT 'TOTCLIENTE' CKEY, TO_CHAR(SUM( ALIM.CLIENTES)) CVALUE 
    From IIEH_ALIMENTADORES ALIM
    INNER JOIN 
        (Select * From (Select Concesionario Empresa From Iieh_Alimentadores Alim
        Inner Join Iieh_Incidenciasat_Det Incidet
        On Alim.Alimentador = Incidet.Alimentador
        Where Incidet.Numerointerrupcion = ? And Rownum =1
        Union All Select 0 From Dual) D
        Where Rownum = 1) Conce
    ON CONCE.EMPRESA = ALIM.CONCESIONARIO
    UNION ALL
    SELECT 'TOTALIMENTADORES' CKEY, TO_CHAR(COUNT(DISTINCT ALIM.ALIMENTADOR)) CVALUE 
    From IIEH_ALIMENTADORES ALIM
    INNER JOIN 
        (Select * From (Select Concesionario Empresa From Iieh_Alimentadores Alim
        Inner Join Iieh_Incidenciasat_Det Incidet
        On Alim.Alimentador = Incidet.Alimentador
        Where Incidet.Numerointerrupcion = ? And Rownum =1
        Union All Select 0 From Dual) D
        Where Rownum = 1) Conce
    ON CONCE.EMPRESA = ALIM.CONCESIONARIO
[43]
Select 
    Abs(Iiat.Numerointerrupcion) Numerointerrupcion, 
    To_Char(Iiat.Fechainterrupcion,' HH24:MI:SS DD-MM-YYYY') Fechainterrupcion, 
    TO_CHAR(IIAT.FECHATERMINOINTERRUPCION,' HH24:MI:SS DD-MM-YYYY') FECHATERMINOINTERRUPCION,
    Iiat.Descripcion,
    IIAT.CANT_COMUNAS, 
    Iiat.Cant_Cli,
    Iiat.Usuariocrea,
    IIAT.USUARIOMODIFICA,
    To_Char(Iiat.Fechacrea,'HH24:MI:SS DD-MM-YYYY') Fechacrea,
    TO_CHAR(IIAT.FECHAMODIFICA,'HH24:MI:SS DD-MM-YYYY') FECHAMODIFICA
From 
    Iieh_Incidenciasat  Iiat
Where Fechaterminointerrupcion Is Null 
AND Iiat.Numerointerrupcion in (Select DISTINCT Numerointerrupcion From Iieh_Incidenciasat_Det Iidet
Inner Join Iieh_Alimentadores Alim
On Alim.Alimentador = Iidet.Alimentador
Where Alim.CONCESIONARIO = ?)
[44]
Select 
    Abs(Iiat.Numerointerrupcion) Numerointerrupcion, 
    To_Char(Iiat.Fechainterrupcion,' HH24:MI:SS DD-MM-YYYY') Fechainterrupcion, 
    TO_CHAR(IIAT.FECHATERMINOINTERRUPCION,' HH24:MI:SS DD-MM-YYYY') FECHATERMINOINTERRUPCION,
    Iiat.Descripcion,
    IIAT.CANT_COMUNAS, 
    Iiat.Cant_Cli,
    Iiat.Usuariocrea,
    IIAT.USUARIOMODIFICA,
    To_Char(Iiat.Fechacrea,'HH24:MI:SS DD-MM-YYYY') Fechacrea,
    TO_CHAR(IIAT.FECHAMODIFICA,'HH24:MI:SS DD-MM-YYYY') FECHAMODIFICA
From 
    Iieh_Incidenciasat  Iiat
Where Fechaterminointerrupcion Is Null 
AND Iiat.Numerointerrupcion in (Select DISTINCT Numerointerrupcion From Iieh_Incidenciasat_Det Iidet
Inner Join Iieh_Alimentadores Alim
On Alim.Alimentador = Iidet.Alimentador)
[45]
Select 
    Abs(Iiat.Numerointerrupcion) Numerointerrupcion, 
    To_Char(Iiat.Fechainterrupcion,' HH24:MI:SS DD-MM-YYYY') Fechainterrupcion, 
    TO_CHAR(IIAT.FECHATERMINOINTERRUPCION,' HH24:MI:SS DD-MM-YYYY') FECHATERMINOINTERRUPCION,
    Iiat.Descripcion,
    IIAT.CANT_COMUNAS, 
    Iiat.Cant_Cli,
    Iiat.Usuariocrea,
    IIAT.USUARIOMODIFICA,
    To_Char(Iiat.Fechacrea,'HH24:MI:SS DD-MM-YYYY') Fechacrea,
    TO_CHAR(IIAT.FECHAMODIFICA,'HH24:MI:SS DD-MM-YYYY') FECHAMODIFICA
From 
    Iieh_Incidenciasat  Iiat
Where Fechaterminointerrupcion Is Null 
AND Iiat.Numerointerrupcion not in (Select DISTINCT Numerointerrupcion From Iieh_Incidenciasat_Det Iidet
Inner Join Iieh_Alimentadores Alim
On Alim.Alimentador = Iidet.Alimentador)   
[46]
     Select 
     Nvl(Es_Admin, 0) As Es_Admin,
     Nvl(Users.userempresa, 0) As Empresa,
     Nvl(PermisoAt, 0) As PermisoAt,
     Nvl(PermisoMt, 0) As PermisoMt,
     Nvl(PermisoBt, 0) As PermisoBt,
     Nvl(Validador, 0) As Validador,
     Nvl(Mensajes, 0) As Mensajes,
     Nvl(ReporteGrafico, 0) As ReporteGrafico,
     Nvl(AdminPermUsu, 0) As AdminPermUsu
     From Iieh_Permisos Per
     Inner Join Iieh_Users Users
     on Users.Role = Per.Rolid
     Where Users.Username = ?
     AND Users.Activo = 1 
[47]
Select anho, mes, dia, hora,Minu, SUM(Clientes_Afectados)Clientes_Afectados
  from (
Select r.anho, r.mes, r.dia, r.hora,
case
    when r.Minutos between 0 and 14 then 00
    when r.Minutos between 15 and 29 then 15
    when r.Minutos between 30 and 44 then 30
    when r.Minutos between 45 and 59 then 45
end Minu,
SUM(r.Clientes_Afectados)Clientes_Afectados from
(select
TO_NUMBER(To_Char(Idet_Fechahorainforme, 'YYYY')) anho,
To_Number(To_Char(Idet_Fechahorainforme, 'MM')) mes,
To_Number(To_Char(Idet_Fechahorainforme, 'dd')) dia,
To_Number(To_Char(Idet_Fechahorainforme, 'hh24')) Hora,
To_Number(To_Char(Idet_Fechahorainforme, 'mi')) Minutos,
To_Number(Idet_Cantidadclientesafectados) Clientes_Afectados
From Iieh_Mensajes_Detalles
Where Idet_Fechahorainforme between sysdate - 7 and sysdate
Order By Idet_Fechahorainforme ) R
Group By R.Anho, R.Mes, R.Dia, R.Hora, r.Minutos)
Group By anho, mes, dia, hora,Minu, Clientes_Afectados
order by anho, mes asc, dia asc, hora asc,minu asc
[48]
Select Comuna, Empresa, SUM(Clientes) Clientes, SUM(Brigadas) Brigadas
  from (
Select
Com.Icom_Nombre Comuna,
Emp.Iemp_Nombre Empresa,
Sum(Det.Idet_Cantidadclientesafectados) Clientes ,
Sum(Det.Idet_Cuadrillaslivianas + Det.Idet_Cuadrillaspesadas) Brigadas,
(case
    when To_Number(To_Char(Det.Idet_Fechahorainforme, 'mi')) between 0 and 14 then 00
    when To_Number(To_Char(Det.Idet_Fechahorainforme, 'mi')) between 15 and 29 then 15
    when To_Number(To_Char(Det.Idet_Fechahorainforme, 'mi')) between 30 and 44 then 30
    when To_Number(To_Char(Det.Idet_Fechahorainforme, 'mi')) between 45 and 59 then 45
end) Minu
From Iieh_Mensajes_Detalles Det
Inner Join Iieh_Empresas Emp On Emp.Iemp_Codigosec = Det.Idet_Concesionaria
Inner Join Iieh_Comunas Com On Com.Icom_Comuna = Det.Idet_Comuna
Where
To_Number(To_Char(Det.Idet_Fechahorainforme, 'YYYY')) = ? And
To_Number(To_Char(Det.Idet_Fechahorainforme, 'MM')) = ? And
To_Number(To_Char(Det.Idet_Fechahorainforme, 'dd')) = ? And 
To_Number(To_Char(Det.Idet_Fechahorainforme, 'hh24')) = ? 
Group By Idet_Fechahorainforme, Com.Icom_Nombre, Emp.Iemp_Nombre
)
Where Clientes > 0 and 
Minu = ? 
Group By Comuna, empresa
Order By 3 Desc
[49]
Select UserName, Nombre, Role, Password, Activo
From Iieh_Users where Activo = 1
[50]
Select * From Iieh_Permisos 
where Usuario = ?
[51]
 Select Role.Role, Role.Nombre, Role.Apellido, Perm.Es_Admin, Perm.Empresa From Iieh_Role Role
Left Join Iieh_Permisos Perm On Role.Role = Perm.Rolid
[52]
Select ROLE.ROLE, ROLE.NOMBRE, ROLE.APELLIDO, PERM.ES_ADMIN, Perm.Empresa From Iieh_Role Role
Left Join Iieh_Permisos Perm On Role.Role = Perm.Rolid
WHERE ROLE.ROLE = ?
[53]
INSERT INTO IIEH_USERS
(USERNAME, PASSWORD, ROLE, NOMBRE, ACTIVO, USEREMPRESA)
values
(?,?,?,?,?,?)
[54]
UPDATE IIEH_USERS
SET NOMBRE = ? ,PASSWORD = ? ,
ROLE = ? , ACTIVO = ? , USEREMPRESA = ? 
WHERE USERNAME = ?
[55]
INSERT INTO IIEH_ROLE
(ROLE, NOMBRE, APELLIDO)
values
(?, 'Despachador Principal', ?)
[56]
INSERT INTO IIEH_PERMISOS
(ROLID, ES_ADMIN, EMPRESA, PERMISOAT,PERMISOMT,PERMISOBT,VALIDADOR, MENSAJES,REPORTEGRAFICO, ADMINPERMUSU)
values
(?,?,?,?,?,?,?,?,?,?)
[57]
UPDATE IIEH_ROLE
SET APELLIDO = ?
WHERE ROLE = ?
[58]
UPDATE IIEH_PERMISOS
SET ES_ADMIN = ?,  PERMISOAT = ?,PERMISOMT = ?,PERMISOBT = ?,
VALIDADOR = ?, MENSAJES = ?,REPORTEGRAFICO  = ?, ADMINPERMUSU = ?
WHERE ROLID = ?
[59]
     Select 
     Nvl(Es_Admin, 0) As Es_Admin,
     Nvl(PermisoAt, 0) As PermisoAt,
     Nvl(PermisoMt, 0) As PermisoMt,
     Nvl(PermisoBt, 0) As PermisoBt,
     Nvl(Validador, 0) As Validador,
     Nvl(Mensajes, 0) As Mensajes,
     Nvl(ReporteGrafico, 0) As ReporteGrafico,
     Nvl(AdminPermUsu, 0) As AdminPermUsu,
     Nvl(Empresa, 0) As Empresa
     From Iieh_Permisos
     Where Rolid = ?
[60]
Select Comuna, Empresa, SUM(Clientes) Clientes, Brigadas
  from (
Select 
Com.Icom_Nombre Comuna,
Emp.Iemp_Nombre Empresa,
Sum(Det.Idet_Cantidadclientesafectados) Clientes ,
Sum(Det.Idet_Cuadrillaslivianas + Det.Idet_Cuadrillaspesadas) Brigadas
From Iieh_Mensajes_Detalles Det
Inner Join Iieh_Empresas Emp On Emp.Iemp_Codigosec = Det.Idet_Concesionaria
Inner Join Iieh_Comunas Com On Com.Icom_Comuna = Det.Idet_Comuna
Group By Com.Icom_Nombre, Emp.Iemp_Nombre)
 Where Clientes > 0 Group By Comuna, Empresa, Clientes, Brigadas
 Order By 3 Desc
[61]
SELECT SEQ_ROLE.NEXTVAL NEXTID from dual
[62]
SELECT COUNT(*) as resultado FROM IIEH_ROLE WHERE TRIM(APELLIDO) = TRIM(?) 
[63]
SELECT 
    USEREMPRESA
FROM 
    IIEH_USERS
WHERE USERNAME =?
[64]
Select u.Username, u.Nombre, u.Role, u.Password, u.Activo
From Iieh_Users U
where u.userempresa = ?  and u.Activo = 1
[65]
Select Fecha, Hora||':'||
Case
    when Minutos between 0 and 14 then '00'
    when Minutos between 15 and 29 then '15'
    when Minutos between 30 and 44 then '30'
    when Minutos between 45 and 59 then '45'
end Minu,
Comuna, Empresa, Sum(Clientes) Clientes, Sum(Brigadas) Cuadrillas
from (
    Select To_Char(Det.Idet_Fechahorainforme, 'YYYY/MM/dd') Fecha,
    To_CHAR(Det.Idet_Fechahorainforme, 'HH24') Hora,
    To_CHAR(Det.Idet_Fechahorainforme, 'MI') Minutos,
    Com.Icom_Nombre Comuna,
    CASE Emp.Iemp_Nombre
        WHEN 'CHILECTRA' THEN 'ENEL DX'
        WHEN 'LOS ANDES' THEN 'LUZ ANDES'
    ELSE Emp.Iemp_Nombre
    END Empresa,
    Sum(Det.Idet_Cantidadclientesafectados) Clientes ,
    Sum(Det.Idet_Cuadrillaslivianas + Det.Idet_Cuadrillaspesadas) Brigadas
    From Iieh_Mensajes_Detalles Det
    Inner Join Iieh_Empresas Emp On Emp.Iemp_Codigosec = Det.Idet_Concesionaria
    Inner Join Iieh_Comunas Com On Com.Icom_Comuna = Det.Idet_Comuna
    Where Det.Idet_Fechahorainforme Between To_Date(?, 'HH24:mi:ss dd-MM-YYYY')
    And To_Date(?, 'HH24:mi:ss dd-MM-YYYY')
    Group By To_Char(Det.Idet_Fechahorainforme, 'YYYY/MM/dd'), To_Char(Det.Idet_Fechahorainforme, 'HH24'),
    To_CHAR(Det.Idet_Fechahorainforme, 'MI'),Com.Icom_Nombre, Emp.Iemp_Nombre
)Group By Empresa,Comuna,Fecha, Hora, Minutos
Order By Empresa,Fecha, Hora,3,5 Desc
[66]
Select Fecha, Hora,
Case
    when Minutos between 0 and 14 then '00'
    when Minutos between 15 and 29 then '15'
    when Minutos between 30 and 44 then '30'
    when Minutos between 45 and 59 then '45'
end Minu,
Comuna, Empresa, Sum(Clientes) Clientes, Sum(Brigadas) Cuadrillas
from (
Select To_Char(Det.Idet_Fechahorainforme, 'YYYY/MM/dd') Fecha,
To_CHAR(Det.Idet_Fechahorainforme, 'HH24') Hora,
To_CHAR(Det.Idet_Fechahorainforme, 'MI') Minutos,
Com.Icom_Nombre Comuna,
CASE Emp.Iemp_Nombre WHEN 'CHILECTRA' THEN 'ENEL DX' WHEN 'LOS ANDES' THEN 'LUZ ANDES'
ELSE Emp.Iemp_Nombre END Empresa,
Sum(Det.Idet_Cantidadclientesafectados) Clientes ,
Sum(Det.Idet_Cuadrillaslivianas + Det.Idet_Cuadrillaspesadas) Brigadas
From Iieh_Mensajes_Detalles Det
Inner Join Iieh_Empresas Emp On Emp.Iemp_Codigosec = Det.Idet_Concesionaria
Inner Join Iieh_Comunas Com On Com.Icom_Comuna = Det.Idet_Comuna
Where Det.Idet_Fechahorainforme Between To_Date(?, 'HH24:mi:ss dd-MM-YYYY')
And To_Date(?, 'HH24:mi:ss dd-MM-YYYY')
and Emp.iemp_codigosec = ? --solo cuando se seleccione filtro distinto a TODOS
Group By To_Char(Det.Idet_Fechahorainforme, 'YYYY/MM/dd'), To_Char(Det.Idet_Fechahorainforme, 'HH24'),
To_Char(Det.Idet_Fechahorainforme, 'MI'),
Com.Icom_Nombre, Emp.Iemp_Nombre
)Group By Empresa,Comuna,Fecha, Hora, Minutos
Order By Empresa,Fecha, Hora, Minu
[67]
Select u.Username, u.Nombre, u.Role, u.Password, u.Activo
From Iieh_Users U
Inner Join Iieh_permisos p
On P.Rolid = U.Role
where p.es_admin = 1 and u.Activo = 1
[68]
UPDATE IIEH_INCIDENCIASAT_DET 
SET FECHATERMINOINTERRUPCION = ?, USUARIOMODIFICA = ?, FECHAMODIFICA = CURRENT_DATE, 
CANT_CLI = ? 
WHERE NUMEROINTERRUPCION = ? 
[69]
select EXISTE, ACTIVO FROM (
Select 1 Existe, Activo
From Iieh_Users Where Nombre = ?
Union All
Select 0 Existe, 0 Activo From Dual)
Where rownum = 1
[70]
Update Iieh_Users
set Username = ?, activo = ?, password = ?, role = ?, userempresa = ?, usermodifica = ?
where nombre = ?
[71]
Select 
    Abs(Iiat.Numerointerrupcion) Numerointerrupcion, 
    To_Char(Iiat.Fechainterrupcion,' HH24:MI:SS DD-MM-YYYY') Fechainterrupcion, 
    TO_CHAR(IIAT.FECHATERMINOINTERRUPCION,' HH24:MI:SS DD-MM-YYYY') FECHATERMINOINTERRUPCION,
    Iiat.Descripcion,
    IIAT.CANT_COMUNAS, 
    Iiat.Cant_Cli,
    Iiat.Usuariocrea,
    IIAT.USUARIOMODIFICA,
    To_Char(Iiat.Fechacrea,'HH24:MI:SS DD-MM-YYYY') Fechacrea,
    To_Char(Iiat.Fechamodifica,'HH24:MI:SS DD-MM-YYYY') Fechamodifica
    ,iiat.tipoincidencia
From 
    Iieh_Incidenciasat  Iiat
Where Iiat.Fechaterminointerrupcion Is Null 
and Iiat.Empresa = ?
and (Iiat.Tipoincidencia = ? OR Iiat.Tipoincidencia is null)
order by Iiat.Numerointerrupcion asc
[72]
Select VALOR from iieh_parametros where id_parametro = ?
[73]
update iieh_parametros set VALOR = ? where id_parametro = ?
[74]
Select ID_CORREO, CORREO from iieh_correos_notificaciones
[75]
Insert into iieh_correos_notificaciones (ID_CORREO, CORREO) values (?,?)
[76]
delete iieh_correos_notificaciones where id_correo = ?
[77]
SELECT SEQ_CORREOS.NEXTVAL NEXTID from dual
[78]
call obt_incidencias_sec()
[79]
select  decode(idet_concesionaria,10,'ENEL_DIST',12,'COLINA',15,'LUZ ANDES') as EMPRESA, sum(idet_cantidadclientesafectados) as ClientesAfectados
from iieh_mensajes_detalles
where idet_icab_id in (
                    select nvl(max(idet_icab_id),0)
                    from iieh_mensajes_detalles 
                    where idet_concesionaria = 10
                    and idet_fechahorainforme >= (select max(idet_fechahorainforme) from iieh_mensajes_detalles where idet_fechahorainforme > trunc(sysdate) and idet_concesionaria = 10)
                    group by idet_concesionaria
                    union
                    select nvl(max(idet_icab_id),0)
                    from iieh_mensajes_detalles 
                    where idet_concesionaria = 12
                    and idet_fechahorainforme >= (select max(idet_fechahorainforme) from iieh_mensajes_detalles where idet_fechahorainforme > trunc(sysdate) and idet_concesionaria = 12)
                    group by idet_concesionaria
                    union
                    select nvl(max(idet_icab_id),0)
                    from iieh_mensajes_detalles 
                    where idet_concesionaria = 15
                    and idet_fechahorainforme >= (select max(idet_fechahorainforme) from iieh_mensajes_detalles where idet_fechahorainforme > trunc(sysdate) and idet_concesionaria = 15)
                    group by idet_concesionaria
)
and idet_fechahorainforme > to_date(sysdate - 5/(24*60))
group by idet_concesionaria
[81]
select
rp.LINEA , rp.CTO , rp.BARRA , rp.BF , rp.SDAC , rp.CE , rp.SUBESTACION , rp.ALIMENTADOR ,ia.COMUNA,rp.ALIM_ID
from rpt_linea rp
inner join iieh_alimentadores ia on rp.ALIM_ID = ia.ALIMENTADOR_ID
[82]
UPDATE RPT_LINEA SET LINEA = TO_CHAR(?), CTO = TO_CHAR(?), BARRA = TO_NUMBER(?), BF = TO_NUMBER(?), SDAC = TO_NUMBER(?), CE = TO_NUMBER(?), SUBESTACION = TO_CHAR(?), ALIMENTADOR = TO_CHAR(?) WHERE ALIM_ID = TO_CHAR(?)
[83]
DELETE RPT_LINEA WHERE ALIM_ID = TO_CHAR(?)
[84]
insert into RPT_LINEA (LINEA , CTO , BARRA , BF , SDAC , CE , SUBESTACION , ALIMENTADOR, ALIM_ID) VALUES(TO_CHAR(?) , TO_CHAR(?) , TO_NUMBER(?) , TO_NUMBER(?) , TO_NUMBER(?) , TO_NUMBER(?) , TO_CHAR(?) , TO_CHAR(?), TO_CHAR(?))
[85]
select
    ia.ALIMENTADOR_ID as ID,
    LOWER(ia.ALIMENTADOR) as NOMBRE,
    LOWER(ia.COMUNA) as COMUNA
from iieh_alimentadores ia