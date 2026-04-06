package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.repository.SigunguMasterRepository;
import com.ieum.admin.festival.application.dto.RegionOptionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SigunguOptionService {
    private final SigunguMasterRepository sigunguMasterRepository;

    public String resolveLabel(String regionCode, String sigunguCode) {
        if (regionCode == null || sigunguCode == null) return "미지정";
        String name = sigunguMasterRepository.findNameByRegionCodeAndSigunguCode(regionCode, sigunguCode);
        return name != null ? name : "미지정";
    }

    /**
     * 특정 지역의 활성화된 시군구 옵션 목록 반환
     */
    public List<RegionOptionDto> getSigungusByAreaCode(String areaCode) {
        return sigunguMasterRepository.findByRegionCode(areaCode).stream()
                .filter(s -> s.isActive())
                .map(s -> new RegionOptionDto(s.getSigunguCode(), s.getName(), "STANDARD"))
                .collect(Collectors.toList());
    }
}
