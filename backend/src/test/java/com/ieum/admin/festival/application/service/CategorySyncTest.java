package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import com.ieum.admin.festival.adapter.out.persistence.repository.CategoryMasterRepository;
import com.ieum.admin.festival.application.port.in.SyncCategoryMasterUseCase;
import com.ieum.admin.festival.application.result.DataSyncResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import java.util.List;
import java.util.stream.Collectors;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.sql.init.mode=never",
    "tour-api.service-key=322e530c75f9c8df08b2302da8e51cf93bc1d45b5f5c285e6ca8432a45727562",
    "tour-api.base-url=https://apis.data.go.kr/B551011/KorService1",
    "jwt.secret=P7p5GH0yUYGq3rm9FxPEZVrXVzca8gzog8gG63ZZFTc="
})
public class CategorySyncTest {

    @Autowired
    private SyncCategoryMasterUseCase syncCategoryMasterUseCase;

    @Autowired
    private CategoryMasterRepository repository;

    @Autowired
    private CategoryOptionService categoryOptionService;

    @BeforeEach
    void setup() {
        repository.deleteAll();
        // Insert custom row to verify it's kept
        CategoryMasterEntity custom = new CategoryMasterEntity("CUSTOM_01", "자체기획축제", "CUSTOM", 1, null);
        repository.save(custom);
    }

    @Test
    void executeSyncAndVerify() {
        System.out.println("=== 1. /sync/categories 실행 결과 ===");
        DataSyncResult result = syncCategoryMasterUseCase.syncCategories();
        System.out.println("Status: " + result.getStatus());
        System.out.println("Total Changed: " + result.getTotalChanged());
        System.out.println("Category Changed Details: " + result.getDetails().getCategory());

        System.out.println("\n=== 2. master_category 실제 적재 상태 ===");
        List<CategoryMasterEntity> all = repository.findAll();
        System.out.println("Total Rows in DB: " + all.size());
        
        long level1 = all.stream().filter(e -> e.getLevel() == 1).count();
        long level2 = all.stream().filter(e -> e.getLevel() == 2).count();
        long level3 = all.stream().filter(e -> e.getLevel() == 3).count();
        System.out.println("Level 1 Count: " + level1);
        System.out.println("Level 2 Count: " + level2);
        System.out.println("Level 3 Count: " + level3);

        System.out.println("\n=== parent_code 예시 5개 ===");
        all.stream().filter(e -> e.getParentCode() != null).limit(5).forEach(e -> {
            System.out.println(e.getCode() + " (" + e.getName() + ", L" + e.getLevel() + ") -> parent: " + e.getParentCode());
        });

        System.out.println("\n=== CUSTOM row 유지 여부 ===");
        all.stream().filter(e -> "CUSTOM".equals(e.getType())).forEach(e -> {
            System.out.println("Code: " + e.getCode() + ", Name: " + e.getName() + ", Active: " + e.isActive());
        });

        System.out.println("\n=== 3. CategoryOptionService 응답 예시 (선착순 5개) ===");
        categoryOptionService.getMergedCategoryOptions().stream().limit(5).forEach(dto -> {
            System.out.println("Value (code): " + dto.getValue() + ", Label (name): " + dto.getLabel() + ", Type: " + dto.getType());
        });
    }

    @org.springframework.boot.test.context.TestConfiguration
    public static class TestConfig {
        @org.springframework.context.annotation.Bean
        @org.springframework.context.annotation.Primary
        public com.ieum.admin.festival.application.port.out.TourApiOutPort mockTourApi() {
            return (cat1, cat2) -> {
                if (cat1 == null && cat2 == null) {
                    return List.of(
                        new com.ieum.admin.festival.application.dto.ApiCategoryItem("A01", "자연"),
                        new com.ieum.admin.festival.application.dto.ApiCategoryItem("A02", "인문(문화/예술/역사)")
                    );
                } else if ("A01".equals(cat1) && cat2 == null) {
                    return List.of(
                        new com.ieum.admin.festival.application.dto.ApiCategoryItem("A0101", "자연관광지"),
                        new com.ieum.admin.festival.application.dto.ApiCategoryItem("A0102", "관광자원")
                    );
                } else if ("A01".equals(cat1) && "A0101".equals(cat2)) {
                    return List.of(
                        new com.ieum.admin.festival.application.dto.ApiCategoryItem("A01010100", "국립공원"),
                        new com.ieum.admin.festival.application.dto.ApiCategoryItem("A01010200", "도립공원")
                    );
                }
                return List.of();
            };
        }
    }
}
