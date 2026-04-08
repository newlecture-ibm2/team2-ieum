package com.ieum.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class DuplicateCheckTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void findDuplicatePhones() {
        System.out.println("========== 중복 전화번호 체크 시작 ==========");
        
        String sql = "SELECT phone, COUNT(*) as cnt FROM users WHERE phone IS NOT NULL AND phone != '' GROUP BY phone HAVING COUNT(*) > 1";
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);

        if (result.isEmpty()) {
            System.out.println("✅ 중복된 전화번호가 없습니다! 안전하게 UNIQUE 제약 조건을 추가할 수 있습니다.");
        } else {
            System.out.println("⚠️ 중복 데이터 발견!");
            for (Map<String, Object> row : result) {
                System.out.println("- 번호: " + row.get("phone") + " (건수: " + row.get("cnt") + ")");
            }
        }
        System.out.println("===========================================");
    }
}
