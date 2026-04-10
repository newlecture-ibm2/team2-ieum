package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.port.out.MasterDataPort;
import com.ieum.admin.festival.domain.model.RegionMaster;
import com.ieum.admin.festival.application.dto.RegionOptionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegionOptionService {
    private final MasterDataPort masterDataPort;

    /**
     * 지역 코드 → 최신 행정구역 화면 표시명으로 변환
     * displayName(최신 공식) 우선, 없으면 name(구버전) fallback
     */
    public String resolveLabel(String code) {
        if (code == null) return "미지정";
        return masterDataPort.findRegionByCode(code)
                .map(RegionMaster::getEffectiveDisplayName)
                .orElse("미지정");
    }

    /**
     * 활성화된 지역 옵션 목록 반환 (프론트엔드 드롭다운 규격: value, label, type, active)
     * - label: displayName(최신 공식 명칭)을 사용
     * - value: Tour API 코드 유지 (검색 필터링용)
     */
    public List<RegionOptionDto> getMergedRegionOptions() {
        return masterDataPort.findAllRegions().stream()
                .filter(RegionMaster::isActive)
                .map(r -> new RegionOptionDto(
                        r.getRegionCode(),
                        r.getEffectiveDisplayName(),
                        "STANDARD",
                        r.isActive()
                ))
                .collect(Collectors.toList());
    }
}
