import java.sql.*;
import java.util.*;

public class CheckSchema {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://festa-ieum.com:5454/ieum-db";
        String user = "ieum";
        String password = "ieum1334!";

        try {
            Class.forName("org.postgresql.Driver");
            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                System.out.println(">>> [DB Check] Connected to ieum-db!");

                String[] tables = {"users", "posts", "comments", "reviews"};
                DatabaseMetaData metaData = conn.getMetaData();

                for (String table : tables) {
                    System.out.println("\n--- Table: " + table + " ---");
                    ResultSet rs = metaData.getColumns(null, null, table, null);
                    while (rs.next()) {
                        String columnName = rs.getString("COLUMN_NAME");
                        String typeName = rs.getString("TYPE_NAME");
                        System.out.println("  - " + columnName + " (" + typeName + ")");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println(">>> [DB Check] Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
