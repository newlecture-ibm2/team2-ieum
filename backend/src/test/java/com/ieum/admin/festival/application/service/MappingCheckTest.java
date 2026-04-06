package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import com.ieum.admin.festival.adapter.out.persistence.entity.AdminFestivalEntity;
import com.ieum.admin.festival.adapter.out.persistence.repository.CategoryMasterRepository;
import com.ieum.admin.festival.adapter.out.persistence.AdminFestivalRepository;
import com.ieum.admin.festival.application.port.in.SyncCategoryMasterUseCase;
import com.ieum.admin.festival.application.port.in.SyncPublicFestivalUseCase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import java.util.List;

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
public class MappingCheckTest {

    @Autowired
    private SyncCategoryMasterUseCase syncCategoryMasterUseCase;

    @Autowired
    private SyncPublicFestivalUseCase syncPublicFestivalUseCase;

    @Autowired
    private CategoryMasterRepository categoryRepository;

    @Autowired
    private AdminFestivalRepository festivalRepository;

    @Test
    public void runAnalysis() {
        System.out.println("\n========== REAL DATA FETCHING & MAPPING ANALYSIS ==========");
        
        System.out.print("1. Syncing Master Categories... ");
        syncCategoryMasterUseCase.syncCategories();
        System.out.println("Done. Total Categories: " + categoryRepository.count());

        System.out.print("2. Syncing Public Festivals via Tour API... ");
        // Limit to 5 pages if there are too many (the sync loops until totalCount is reached)
        syncPublicFestivalUseCase.syncPublicFestivals(); 
        
        List<AdminFestivalEntity> festivals = festivalRepository.findAll();
        System.out.println("Done. Total Festivals fetched: " + festivals.size());

        System.out.println("\n=== Festivals Category Null Ratio ===");
        long cat1Null = festivals.stream().filter(f -> f.getCategory() == null).count();
        long cat2Null = festivals.stream().filter(f -> f.getCategoryMid() == null).count();
        long cat3Null = festivals.stream().filter(f -> f.getCategorySub() == null).count();
        System.out.printf("Cat1 (category) null count: %d / %d (%.2f%%)\n", cat1Null, festivals.size(), (double)cat1Null/festivals.size()*100);
        System.out.printf("Cat2 (category_mid) null count: %d / %d (%.2f%%)\n", cat2Null, festivals.size(), (double)cat2Null/festivals.size()*100);
        System.out.printf("Cat3 (category_sub) null count: %d / %d (%.2f%%)\n", cat3Null, festivals.size(), (double)cat3Null/festivals.size()*100);

        System.out.println("\n=== Mapping Check Against master_category ===");
        List<CategoryMasterEntity> masterCats = categoryRepository.findAll();
        
        long cat1Matched = festivals.stream()
            .filter(f -> f.getCategory() != null)
            .filter(f -> masterCats.stream().anyMatch(c -> c.getCode().equals(f.getCategory())))
            .count();
        
        long cat2Matched = festivals.stream()
            .filter(f -> f.getCategoryMid() != null)
            .filter(f -> masterCats.stream().anyMatch(c -> c.getCode().equals(f.getCategoryMid())))
            .count();
            
        long cat3Matched = festivals.stream()
            .filter(f -> f.getCategorySub() != null)
            .filter(f -> masterCats.stream().anyMatch(c -> c.getCode().equals(f.getCategorySub())))
            .count();

        System.out.printf("Cat1 Matched count: %d / %d (Excluding nulls: %.2f%%)\n", 
            cat1Matched, festivals.size() - cat1Null, 
            (festivals.size() - cat1Null) == 0 ? 0.0 : (double)cat1Matched/(festivals.size()-cat1Null)*100);

        System.out.printf("Cat2 Matched count: %d / %d (Excluding nulls: %.2f%%)\n", 
            cat2Matched, festivals.size() - cat2Null, 
            (festivals.size() - cat2Null) == 0 ? 0.0 : (double)cat2Matched/(festivals.size()-cat2Null)*100);

        System.out.printf("Cat3 Matched count: %d / %d (Excluding nulls: %.2f%%)\n", 
            cat3Matched, festivals.size() - cat3Null, 
            (festivals.size() - cat3Null) == 0 ? 0.0 : (double)cat3Matched/(festivals.size()-cat3Null)*100);

        System.out.println("\n=== Example Failed Mappings (No Match in DB) ===");
        festivals.stream()
            .filter(f -> f.getCategorySub() != null)
            .filter(f -> masterCats.stream().noneMatch(c -> c.getCode().equals(f.getCategorySub())))
            .limit(5)
            .forEach(f -> System.out.println("Festival ID: " + f.getSourceId() + " -> Unmatched cat3: " + f.getCategorySub()));
    }
}
