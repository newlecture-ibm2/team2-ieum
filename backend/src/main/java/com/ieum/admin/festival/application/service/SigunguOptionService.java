package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.port.out.MasterDataPort;
import com.ieum.admin.festival.domain.model.SigunguMaster;
import com.ieum.admin.festival.application.dto.RegionOptionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SigunguOptionService {
    private final MasterDataPort masterDataPort;

    public String resolveLabel(String regionCode, String sigunguCode) {
        if (regionCode == null || sigunguCode == null) return "미지정";
        return masterDataPort.findSigungusByRegionCode(regionCode).stream()
                .filter(s -> s.getSigunguCode().equals(sigunguCode))
                .findFirst()
                .map(SigunguMaster::getName)
                .orElse("미지정");
    }

    /**
     * 특정 지역의 활성화된 시군구 옵션 목록 반환
     */
    public List<RegionOptionDto> getSigungusByAreaCode(String areaCode) {
        return masterDataPort.findSigungusByRegionCode(areaCode).stream()
                .filter(SigunguMaster::isActive)
                .map(s -> new RegionOptionDto(s.getSigunguCode(), s.getName(), "STANDARD"))
                .collect(Collectors.toList());
    }
}
