package com.ieum;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class DbInspectorTest {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void inspectUsersTable() {
        String sql = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users'";
        List<Map<String, Object>> columns = jdbcTemplate.queryForList(sql);
        System.out.println("========== [ACTUAL DB 'users' TABLE COLUMNS] ==========");
        for (Map<String, Object> col : columns) {
            System.out.printf("Column: %-20s | Type: %-20s | Nullable: %s\n", 
                    col.get("column_name"), col.get("data_type"), col.get("is_nullable"));
        }
        System.out.println("=======================================================");
    }
}
