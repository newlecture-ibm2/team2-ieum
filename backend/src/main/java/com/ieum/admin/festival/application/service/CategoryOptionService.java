package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.repository.CategoryMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryOptionService {
    private final CategoryMasterRepository categoryMasterRepository;

    public String resolveLabel(String code) {
        if (code == null) return "미지정";
        return categoryMasterRepository.findByCode(code)
                .map(c -> c.getName())
                .orElse("미지정");
    }
}
