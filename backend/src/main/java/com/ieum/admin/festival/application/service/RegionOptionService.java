package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.repository.RegionMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegionOptionService {
    private final RegionMasterRepository regionMasterRepository;

    public String resolveLabel(String code) {
        if (code == null) return "미지정";
        return regionMasterRepository.findByRegionCode(code)
                .map(r -> r.getName())
                .orElse("미지정");
    }

    public java.util.List<com.ieum.admin.festival.application.dto.RegionOptionDto> getMergedRegionOptions() {
        return regionMasterRepository.findAll().stream()
                .map(r -> new com.ieum.admin.festival.application.dto.RegionOptionDto(r.getRegionCode(), r.getName()))
                .collect(java.util.stream.Collectors.toList());
    }
}
