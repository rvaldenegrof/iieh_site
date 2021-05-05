package com.enel.cl.iieh.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.sql.DataSource;

public abstract class AbstractDBManager {

	private static Logger log = Logger.getLogger(AbstractDBManager.class.getSimpleName());

	protected java.sql.Date transformDate(java.util.Date date) {
		return (date != null) ? new java.sql.Date(date.getTime()) : null;
	}

	protected abstract DataSource getDatasource();

	protected Connection getConnection() {
		Connection conn = null;
		try {
			conn = getDatasource().getConnection();
			conn.setAutoCommit(false);
		} catch (SQLException e) {
			if (log.isLoggable(Level.SEVERE))
				log.severe("Connection Failed! " + e.getMessage());
		}
		return conn;
	}
        
        protected int executeUpdateWithReturn(Connection conn, int statement, List<Object> params) {
		PreparedStatement ps = null;
		try {
                    int id = this.getCounts(conn, "select max(alim_id)+1 total from rpt_linea");
			ps = conn.prepareStatement(StatementProvider.getInstance().getStatement(statement));
			int param_id = 1;
			if (params != null) {
				for (Object param : params) {
					ps.setObject(param_id++, param);
				}
                                ps.setObject(param_id++, id);
			}
                        log.log(Level.INFO, "ALIM_ID "+id, "");
                        return ps.executeUpdate() > 0 ?   id : 0;
		} catch (Exception e) {
			if (log.isLoggable(Level.WARNING)) {
				log.log(Level.WARNING, "", e);
			}
		} finally {
			safeClose(ps);
		}
		return 0;
	}
        
	protected int executeUpdate(Connection conn, int statement, List<Object> params) {
		PreparedStatement ps = null;
		try {
			ps = conn.prepareStatement(StatementProvider.getInstance().getStatement(statement));
			int param_id = 1;
			if (params != null) {
				for (Object param : params) {
					ps.setObject(param_id++, param);
				}
			}
			return ps.executeUpdate();
		} catch (Exception e) {
			if (log.isLoggable(Level.WARNING)) {
				log.log(Level.WARNING, "", e);
			}
		} finally {
			safeClose(ps);
		}
		return 0;
	}
        protected ArrayList<ArrayList<String>> extractData(Connection conn , String query){
            ArrayList<ArrayList<String>> data = new ArrayList<>();
            Statement stmt3 = null;
            ResultSet rs3 = null;
            try {
                stmt3 = conn.createStatement();
                rs3 = stmt3.executeQuery(query);
                ResultSetMetaData rsmd = rs3.getMetaData(); 
                int columnCount = rsmd.getColumnCount();
                while(rs3.next()){
                    ArrayList<String> buff = new ArrayList<>(columnCount);
                    int i = 1;
                    while(i <= columnCount) {
                         buff.add(rs3.getString(i++));
                    }
                    data.add(buff);
                }
            } catch (Exception e) {
                    if (log.isLoggable(Level.WARNING)) {
                            log.log(Level.WARNING, "", e);
                    }
            } finally {
                safeClose(rs3, stmt3);
            }
            return data;
        }
        protected int getCounts(Connection conn , String query){
            int data = 0;
            Statement stmt3 = null;
            ResultSet rs3 = null;
            try {
                stmt3 = conn.createStatement();
                rs3 = stmt3.executeQuery(query);
                while(rs3.next()){
                    data = rs3.getInt("total");
                }
            } catch (Exception e) {
                    if (log.isLoggable(Level.WARNING)) {
                            log.log(Level.WARNING, "", e);
                    }
            } finally {
                safeClose(rs3, stmt3);
            }
            return data;
        }

	protected List<Map<String, Object>> executeQuery(Connection conn, int query, List<Object> params) {
		List<Map<String, Object>> data = new ArrayList<>();
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			ps = conn.prepareStatement(StatementProvider.getInstance().getStatement(query));
			int param_id = 1;
			if (params != null) {
				for (Object param : params) {
					ps.setObject(param_id++, param);
				}
			}
			rs = ps.executeQuery();
			data.addAll(resultSetToMap(rs));
		} catch (Exception e) {
			if (log.isLoggable(Level.WARNING)) {
				log.log(Level.WARNING, "", e);
			}
		} finally {
			safeClose(rs, ps);
		}
		return data;
	}

	protected List<Map<String, Object>> executeQuery(Connection conn, int query, List<Object> params, Integer startPosition, Integer maxResult) {
		List<Map<String, Object>> data = new ArrayList<>();
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			ps = conn.prepareStatement(StatementProvider.getInstance().getStatement(query));
			int param_id = 1;
			if (params != null) {
				for (Object param : params) {
					ps.setObject(param_id++, param);
				}
			}
			ps.setObject(param_id++, startPosition);
			ps.setObject(param_id++, (startPosition != null && maxResult != null) ? startPosition + maxResult : null);
			rs = ps.executeQuery();
			data.addAll(resultSetToMap(rs));
		} catch (Exception e) {
			if (log.isLoggable(Level.WARNING)) {
				log.log(Level.WARNING, "", e);
			}
		} finally {
			safeClose(rs, ps);
		}
		return data;
	}

	protected List<Map<String, Object>> resultSetToMap(ResultSet rs) throws SQLException {
		List<Map<String, Object>> result = new ArrayList<>();
		ResultSetMetaData md = rs.getMetaData();
		Map<String, Object> record;
		while (rs.next()) {
			result.add(record = new HashMap<>());
			for (int i = 1; i <= md.getColumnCount(); i++) {
				record.put(md.getColumnName(i), rs.getObject(i));
			}
		}
		return result;
	}

	protected void commit(Connection conn) {
		try {
			conn.commit();
		} catch (SQLException e) {
			if (log.isLoggable(Level.WARNING))
				log.warning(e.getMessage());
		}
	}

	protected void safeClose(Object... resources) {
		Statement st = null;
		ResultSet rs = null;
		PreparedStatement ps = null;
		Connection conn = null;
		for (Object object : resources) {
			if (object == null)
				continue;
			if (object instanceof Statement)
				st = (Statement) object;
			if (object instanceof ResultSet)
				rs = (ResultSet) object;
			if (object instanceof PreparedStatement)
				ps = (PreparedStatement) object;
			if (object instanceof Connection)
				conn = (Connection) object;
		}
		safeClose(rs);
		safeClose(ps);
		safeClose(st);
		safeClose(conn);
	}

	private void safeClose(PreparedStatement ps) {
		if (ps != null) {
			try {
				ps.close();
			} catch (SQLException e) {
				if (log.isLoggable(Level.WARNING))
					log.warning(e.getMessage());
			}
		}
	}

	private void safeClose(Statement st) {
		if (st != null) {
			try {
				st.close();
			} catch (SQLException e) {
				if (log.isLoggable(Level.WARNING))
					log.warning(e.getMessage());
			}
		}
	}

	private void safeClose(ResultSet rs) {
		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
				if (log.isLoggable(Level.WARNING))
					log.warning(e.getMessage());
			}
		}
	}

	private void safeClose(Connection conn) {
		if (conn != null) {
			try {
				if (!conn.isClosed())
					conn.close();
			} catch (SQLException e) {
				if (log.isLoggable(Level.WARNING))
					log.warning(e.getMessage());
			}
		}
	}

}
