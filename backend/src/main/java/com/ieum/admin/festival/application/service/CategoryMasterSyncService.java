package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.dto.ApiCategoryItem;
import com.ieum.admin.festival.application.port.in.SyncCategoryMasterUseCase;
import com.ieum.admin.festival.application.port.out.CategoryMasterOutPort;
import com.ieum.admin.festival.application.port.out.TourApiOutPort;
import com.ieum.admin.festival.application.result.DataSyncResult;
import com.ieum.admin.festival.domain.model.CategoryMaster;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryMasterSyncService implements SyncCategoryMasterUseCase {

    private final CategoryMasterOutPort categoryMasterPort;
    private final TourApiOutPort tourApiPort;

    @Override
    @Transactional
    public DataSyncResult syncCategories() {
        log.info("계층형 카테고리 마스터 동기화 시작...");
        try {
            // 1. 기존 DB 데이터 가져오기
            Map<String, CategoryMaster> existingMap = categoryMasterPort.findAllAsMap();
            Map<String, CategoryMaster> toSaveMap = new HashMap<>();

            // 2. cat1 조회
            List<ApiCategoryItem> cat1List = tourApiPort.fetchCategoryOptions(null, null);
            for (ApiCategoryItem cat1 : cat1List) {
                processAndAdd(existingMap, toSaveMap, cat1, 1, null);

                // 3. cat2 조회
                List<ApiCategoryItem> cat2List = tourApiPort.fetchCategoryOptions(cat1.code(), null);
                for (ApiCategoryItem cat2 : cat2List) {
                    processAndAdd(existingMap, toSaveMap, cat2, 2, cat1.code());

                    // 4. cat3 조회
                    List<ApiCategoryItem> cat3List = tourApiPort.fetchCategoryOptions(cat1.code(), cat2.code());
                    for (ApiCategoryItem cat3 : cat3List) {
                        processAndAdd(existingMap, toSaveMap, cat3, 3, cat2.code());
                    }
                }
            }

            // 5. 누락분 Soft Delete 전환 (단, 정상적으로 수집된 경우에만 실행)
            if (!cat1List.isEmpty()) {
                for (Map.Entry<String, CategoryMaster> entry : existingMap.entrySet()) {
                    CategoryMaster existing = entry.getValue();
                    // 기존 DB에는 STANDARD(공공) 상태로 활성화되어 있는데, 이번 API 수집 루프에서 발견되지 않았다면
                    if ("STANDARD".equals(existing.getType()) && existing.isActive() && !toSaveMap.containsKey(entry.getKey())) {
                        existing.deactivate(); // Soft Delete
                        toSaveMap.put(entry.getKey(), existing);
                        log.debug("카테고리 SOFT DELETE 전환: {} ({})", existing.getCode(), existing.getName());
                    }
                }
            }

            // 6. DB 일괄 저장
            if (!toSaveMap.isEmpty()) {
                List<CategoryMaster> sortedList = toSaveMap.values().stream()
                        .sorted(java.util.Comparator.comparing(c -> c.getLevel() == null ? 0 : c.getLevel()))
                        .collect(java.util.stream.Collectors.toList());
                categoryMasterPort.saveAll(sortedList);
            }

            log.info("계층형 카테고리 동기화 완료: 총 {}건 저장/업데이트", toSaveMap.size());

            return DataSyncResult.builder()
                    .status("COMPLETED")
                    .type("CATEGORY")
                    .totalChanged(toSaveMap.size())
                    .details(DataSyncResult.Details.builder().category(toSaveMap.size()).build())
                    .build();

        } catch (Exception e) {
            log.error("계층형 카테고리 동기화 실패: {}", e.getMessage(), e);
            return DataSyncResult.builder().status("FAILED").type("CATEGORY").build();
        }
    }

    private void processAndAdd(Map<String, CategoryMaster> existingMap, 
                               Map<String, CategoryMaster> toSaveMap, 
                               ApiCategoryItem apiItem, 
                               int level, 
                               String parentCode) {
        
        CategoryMaster existing = existingMap.get(apiItem.code());

        if (existing == null) {
            // 신규 INSERT
            CategoryMaster newCategory = CategoryMaster.builder()
                    .code(apiItem.code())
                    .name(apiItem.name())
                    .type("STANDARD")
                    .isActive(true)
                    .level(level)
                    .parentCode(parentCode)
                    .build();
            toSaveMap.put(apiItem.code(), newCategory);
            log.debug("카테고리 INSERT 준비: {} ({}, level={})", apiItem.code(), apiItem.name(), level);
        } else {
            // 변경 UPDATE (이름이 다르거나, 비활성화되어 있는 경우)
            boolean changed = false;
            if (!apiItem.name().equals(existing.getName())) {
                existing.updateName(apiItem.name());
                changed = true;
            }
            if (!existing.isActive()) {
                existing.activate();
                changed = true;
            }
            // 레벨, 부모코드 검증/수정
            if (existing.getLevel() == null || existing.getLevel() != level) {
                existing.setLevel(level);
                changed = true;
            }
            if ((existing.getParentCode() == null && parentCode != null) || 
                (existing.getParentCode() != null && !existing.getParentCode().equals(parentCode))) {
                existing.setParentCode(parentCode);
                changed = true;
            }
            
            if (changed) {
                toSaveMap.put(apiItem.code(), existing);
                log.debug("카테고리 UPDATE 준비: {} ({})", existing.getCode(), existing.getName());
            } else {
                // 변경 없이 존재하는 항목도 toSaveMap에 넣어서 나중에 Soft delete 대상 필터 역할
                toSaveMap.put(apiItem.code(), existing);
            }
        }
    }
}
