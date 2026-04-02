package com.ieum.festival.application.service;

import com.ieum.festival.application.dto.CategoryOptionDto;
import com.ieum.festival.domain.model.CustomCategory;
import com.ieum.festival.domain.model.StandardCategory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CategoryOptionService {

    private final Map<String, String> combinationMap;

    public CategoryOptionService() {
        this.combinationMap = new HashMap<>();

        for (StandardCategory category : StandardCategory.values()) {
            // "A02" 같이 중복 키가 없도록 조심 (위 Enum에서 키 충돌 없음)
            combinationMap.put(category.name(), category.getLabel());
        }

        for (CustomCategory category : CustomCategory.values()) {
            combinationMap.put(category.name(), category.getLabel());
        }
    }

    /**
     * 필터/등록 폼 등 프론트엔드 셀렉트박스 표시를 위해 병합된 카테고리 목록 반환
     */
    public List<CategoryOptionDto> getMergedCategoryOptions() {
        List<CategoryOptionDto> options = new ArrayList<>();

        options.addAll(
                Stream.of(StandardCategory.values())
                        .map(c -> CategoryOptionDto.builder()
                                .value(c.name())
                                .label(c.getLabel())
                                .type("STANDARD")
                                .build())
                        .collect(Collectors.toList()));

        options.addAll(
                Stream.of(CustomCategory.values())
                        .map(c -> CategoryOptionDto.builder()
                                .value(c.name())
                                .label(c.getLabel())
                                .type("CUSTOM")
                                .build())
                        .collect(Collectors.toList()));

        return options;
    }

    /**
     * 응답용: CategoryCode -> label 변환
     */
    public String resolveLabel(String categoryCode) {
        if (categoryCode == null || categoryCode.isBlank()) {
            return "미지정";
        }
        return combinationMap.getOrDefault(categoryCode, categoryCode + " (알 수 없음)");
    }
}
