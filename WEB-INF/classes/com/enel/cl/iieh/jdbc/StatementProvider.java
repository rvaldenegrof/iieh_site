package com.enel.cl.iieh.jdbc;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class StatementProvider {

	private static StatementProvider instance;
	private Map<Integer, String> data;

	private StatementProvider() {
		data = new HashMap<>();
	}

	public static StatementProvider getInstance() throws IOException {
		if (instance == null) {
			instance = new StatementProvider();
			instance.load();
		}
		return instance;
	}

	private void load() throws IOException {
		InputStream is = this.getClass().getResourceAsStream("statements.sql");
		InputStreamReader isr = new InputStreamReader(is);
		BufferedReader br = new BufferedReader(isr);
		String line = null;
		int key = -1;
		while ((line = br.readLine()) != null) {
			if (line.trim().length() == 0) {
			} else if (line.trim().startsWith("[") && line.trim().endsWith("]")) {
				key = Integer.valueOf(line.substring(1, line.length() - 1));
				data.put(key, "");
			} else if (line.trim().startsWith("#")) {
			} else {
				data.put(key, data.get(key) + line + '\n');
			}
		}
		br.close();

	}

	public String getStatement(int id) {
		return (data.containsKey(id)) ? data.get(id) : "";
	}

}
