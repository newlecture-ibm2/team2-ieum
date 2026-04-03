package com.ieum.festival.application.service;

import com.ieum.festival.application.dto.RegionOptionDto;
import com.ieum.festival.adapter.out.persistence.entity.RegionMasterEntity;
import com.ieum.festival.adapter.out.persistence.repository.RegionMasterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegionOptionService {

    private final RegionMasterRepository regionMasterRepository;

    /**
     * 프론트엔드 드롭다운에 제공할 통합 지역 옵션 리스트 반환
     */
    public List<RegionOptionDto> getMergedRegionOptions() {
        return regionMasterRepository.findAll().stream()
                .map(entity -> RegionOptionDto.builder()
                        .value(entity.getRegionCode())
                        .label(entity.getName())
                        .type(entity.getType())
                        .active(entity.isActive())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 데이터 변환 등을 위해 맵으로 반환 (key 충돌 방어)
     */
    public Map<String, String> getCachedRegionMap() {
        return regionMasterRepository.findAll().stream()
                .collect(Collectors.toMap(
                        RegionMasterEntity::getRegionCode,
                        RegionMasterEntity::getName,
                        (existing, replacement) -> existing
                ));
    }

    /**
     * 응답용: areaCode -> label 변환
     */
    public String resolveLabel(String areaCode) {
        if (areaCode == null || areaCode.isBlank()) {
            return "미정";
        }
        
        Map<String, String> combinationMap = getCachedRegionMap();
        return combinationMap.getOrDefault(areaCode, areaCode + " (알 수 없음)");
    }
}
