package com.ieum.festival.application.service;

import com.ieum.festival.application.dto.RegionOptionDto;
import com.ieum.festival.domain.model.CustomRegion;
import com.ieum.festival.domain.model.StandardRegion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegionOptionService {

    /**
     * 프론트엔드 드롭다운에 제공할 통합 지역 옵션 리스트 반환
     */
    public List<RegionOptionDto> getMergedRegionOptions() {
        List<RegionOptionDto> options = new ArrayList<>();

        // 1. 공공 통합 표준 17개 지역
        for (StandardRegion standardRegion : StandardRegion.values()) {
            options.add(RegionOptionDto.builder()
                    .label(standardRegion.getLabel())
                    .value(standardRegion.getValue())
                    .type(standardRegion.getType())
                    .build());
        }

        // 2. 내부 예외 Enum (자체 기획 특수 지역)
        for (CustomRegion customRegion : CustomRegion.values()) {
            options.add(RegionOptionDto.builder()
                    .label(customRegion.getLabel())
                    .value(customRegion.getValue())
                    .type(customRegion.getType())
                    .build());
        }

        return options;
    }

    /**
     * 데이터 변환 등을 위해 맵으로 반환 (key 충돌 방어)
     */
    public Map<String, String> getCachedRegionMap() {
        return getMergedRegionOptions().stream()
                .collect(Collectors.toMap(
                        RegionOptionDto::getValue,
                        RegionOptionDto::getLabel,
                        (existing, replacement) -> existing // 키 충돌 시 기존 값 유지 방어 로직
                ));
    }

    /**
     * 응답용: areaCode -> label 변환
     * (매핑 실패 시 Fallback 정책: "알 수 없음")
     */
    public String resolveLabel(String areaCode) {
        if (areaCode == null || areaCode.isBlank()) {
            return "미정";
        }
        
        Map<String, String> combinationMap = getCachedRegionMap();
        return combinationMap.getOrDefault(areaCode, areaCode + " (알 수 없음)");
    }
}
