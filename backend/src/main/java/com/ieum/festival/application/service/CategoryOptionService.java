package com.ieum.festival.application.service;

import com.ieum.festival.application.dto.CategoryOptionDto;
import com.ieum.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import com.ieum.festival.adapter.out.persistence.repository.CategoryMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryOptionService {

    private final CategoryMasterRepository categoryRepo;

    /**
     * 필터/등록 폼 등 프론트엔드 셀렉트박스 표시를 위해 병합된 카테고리 목록 반환
     */
    public List<CategoryOptionDto> getMergedCategoryOptions() {
        List<CategoryMasterEntity> entities = categoryRepo.findByIsActiveTrue();
        
        List<CategoryOptionDto> options = new ArrayList<>();
        options.addAll(
                entities.stream()
                        .filter(e -> "STANDARD".equals(e.getType()))
                        .map(e -> CategoryOptionDto.builder()
                                .value(e.getCategoryCode())
                                .label(e.getName())
                                .type(e.getType())
                                .build())
                        .collect(Collectors.toList()));

        options.addAll(
                entities.stream()
                        .filter(e -> "CUSTOM".equals(e.getType()))
                        .map(e -> CategoryOptionDto.builder()
                                .value(e.getCategoryCode())
                                .label(e.getName())
                                .type(e.getType())
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
        return categoryRepo.findById(categoryCode)
                .map(CategoryMasterEntity::getName)
                .orElse(categoryCode + " (알 수 없음)");
    }
}
