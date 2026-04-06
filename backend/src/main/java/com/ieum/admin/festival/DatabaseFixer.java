package com.ieum.admin.festival;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

/**
 * 초기 카테고리 마스터 데이터 보정용 Runner.
 * 일반 기동 시에는 실행되지 않으며, --spring.profiles.active=init 으로 명시적으로 실행해야 합니다.
 */
@Component
@RequiredArgsConstructor
@Profile("init")
public class DatabaseFixer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        int rows = jdbcTemplate.update("UPDATE master_category SET is_active = true WHERE type = 'STANDARD'");
        System.out.println("FIXED DB: set " + rows + " categories to active");

        String insertSql = "INSERT INTO master_category (code, name, type, is_active, level, parent_code) " +
                "VALUES (?, ?, 'STANDARD', true, ?, ?) ON CONFLICT (code) DO NOTHING";
                
        int inserts = 0;
        inserts += jdbcTemplate.update(insertSql, "A02", "인문(문화/예술/역사)", 1, null);
        inserts += jdbcTemplate.update(insertSql, "A0207", "축제", 2, "A02");
        inserts += jdbcTemplate.update(insertSql, "A02070100", "문화관광축제", 3, "A0207");
        inserts += jdbcTemplate.update(insertSql, "A02070200", "일반축제", 3, "A0207");
        inserts += jdbcTemplate.update(insertSql, "A0208", "행사/공연", 2, "A02");
        inserts += jdbcTemplate.update(insertSql, "A02081300", "기타행사", 3, "A0208");
        
        // 자체생성 하위
        jdbcTemplate.update("INSERT INTO master_category (code, name, type, is_active, level, parent_code) " +
                "VALUES (?, ?, 'CUSTOM', true, ?, ?) ON CONFLICT (code) DO NOTHING", "CUSTOM_C01", "자체생성", 1, null);
        inserts += jdbcTemplate.update("INSERT INTO master_category (code, name, type, is_active, level, parent_code) " +
                "VALUES (?, ?, 'CUSTOM', true, ?, ?) ON CONFLICT (code) DO NOTHING", "CUS_C01_M1", "일반 축제", 2, "CUSTOM_C01");
        inserts += jdbcTemplate.update("INSERT INTO master_category (code, name, type, is_active, level, parent_code) " +
                "VALUES (?, ?, 'CUSTOM', true, ?, ?) ON CONFLICT (code) DO NOTHING", "CUS_C01_M2", "대학 축제", 2, "CUSTOM_C01");
        
        System.out.println("FIXED DB: inserted " + inserts + " missing subcategories");
    }
}
