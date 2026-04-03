package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.repository.SigunguMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SigunguOptionService {
    private final SigunguMasterRepository sigunguMasterRepository;

    public String resolveLabel(String regionCode, String sigunguCode) {
        if (regionCode == null || sigunguCode == null) return "미지정";
        String name = sigunguMasterRepository.findNameByRegionCodeAndSigunguCode(regionCode, sigunguCode);
        return name != null ? name : "미지정";
    }

    public java.util.List<com.ieum.admin.festival.application.dto.RegionOptionDto> getSigungusByAreaCode(String areaCode) {
        return sigunguMasterRepository.findByRegionCode(areaCode).stream()
                .map(s -> new com.ieum.admin.festival.application.dto.RegionOptionDto(s.getSigunguCode(), s.getName()))
                .collect(java.util.stream.Collectors.toList());
    }
}
