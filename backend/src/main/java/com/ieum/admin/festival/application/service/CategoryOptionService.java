package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.dto.CategoryOptionDto;
import com.ieum.admin.festival.application.port.out.CategoryMasterOutPort;
import com.ieum.admin.festival.domain.model.CategoryMaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryOptionService {
    private final CategoryMasterOutPort categoryMasterPort;

    public String resolveLabel(String code) {
        if (code == null) return "미지정";
        Map<String, CategoryMaster> map = categoryMasterPort.findAllAsMap();
        
        String currentCode = code;
        while (currentCode != null && !currentCode.isEmpty()) {
            CategoryMaster cat = map.get(currentCode);
            if (cat != null) {
                return buildHierarchyName(cat, map);
            }
            
            // 공공 API 기준 코드 체계 (대:3, 중:5, 소:7~9자리 이상)
            if (currentCode.length() > 5) {
                currentCode = currentCode.substring(0, 5);
            } else if (currentCode.length() > 3) {
                currentCode = currentCode.substring(0, 3);
            } else {
                currentCode = null;
            }
        }
        return "미지정";
    }

    private String buildHierarchyName(CategoryMaster c, Map<String, CategoryMaster> map) {
        String name = c.getName();
        if (c.getLevel() != null && c.getLevel() == 3 && c.getParentCode() != null) {
            CategoryMaster parent = map.get(c.getParentCode());
            if (parent != null) {
                name = parent.getName() + " > " + name;
            }
        }
        return name;
    }

    /**
     * 활성화된 카테고리 옵션 목록 반환 (프론트엔드 규격: value, label, type)
     * - 축제(Festival) 도메인에 불필요한 숙박/쇼핑/음식 등의 카테고리 제거
     */
    public List<CategoryOptionDto> getMergedCategoryOptions() {
        Map<String, CategoryMaster> map = categoryMasterPort.findAllAsMap();
        return map.values().stream()
                .filter(CategoryMaster::isActive)
                .filter(this::isFestivalCategory)
                .map(c -> new CategoryOptionDto(c.getCode(), buildHierarchyName(c, map), c.getType()))
                .collect(Collectors.toList());
    }

    private boolean isFestivalCategory(CategoryMaster c) {
        // 대분류(Level 1) 완전 제거
        if (c.getLevel() != null && c.getLevel() == 1) {
            return false;
        }

        if ("CUSTOM".equals(c.getType())) {
            return true;
        }
        if ("STANDARD".equals(c.getType())) {
            String code = c.getCode();
            // A0207(축제 하위), A0208(행사/공연 하위)만 노출
            return code.startsWith("A0207") || code.startsWith("A0208");
        }
        return false;
    }

    /**
     * 특정 카테고리 코드와 그 하위(자손) 카테고리 코드들의 목록을 반환
     */
    public List<String> getSelfAndDescendantCodes(String baseCode) {
        if (baseCode == null || baseCode.isEmpty()) {
            return null; // 조건 없음으로 사용하기 위해 null 반환
        }
        
        Map<String, CategoryMaster> allCats = categoryMasterPort.findAllAsMap();
        if (!allCats.containsKey(baseCode)) {
            return List.of(baseCode); // 알 수 없는 코드면 본인만 반환 (검색 결과 0건 유도)
        }
        
        List<String> result = new java.util.ArrayList<>();
        collectDescendants(baseCode, allCats, result);
        return result.isEmpty() ? null : result;
    }

    private void collectDescendants(String currentCode, Map<String, CategoryMaster> allCats, List<String> result) {
        result.add(currentCode);
        // 모든 카테고리 중 parentCode가 currentCode인 자식 탐색
        for (CategoryMaster cat : allCats.values()) {
            if (currentCode.equals(cat.getParentCode())) {
                collectDescendants(cat.getCode(), allCats, result);
            }
        }
    }
}
