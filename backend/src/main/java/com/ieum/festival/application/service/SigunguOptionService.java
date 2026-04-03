package com.ieum.festival.application.service;

import com.ieum.festival.application.dto.RegionOptionDto;

import com.ieum.festival.adapter.out.persistence.repository.SigunguMasterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SigunguOptionService {

    private final SigunguMasterRepository sigunguMasterRepository;

    /**
     * 프론트엔드 드롭다운에 제공할 시군구 옵션 리스트.
     * 수정 폼 등의 매핑 유지를 위해 비활성화(is_active=false)된 항목도 노출시키되, 
     * 프론트엔드에서 신규 선택 시 필터링할 수 있도록 active 필드를 함께 반환.
     */
    public List<RegionOptionDto> getSigungusByAreaCode(String areaCode) {
        return sigunguMasterRepository.findByRegionCode(areaCode).stream()
                .map(entity -> RegionOptionDto.builder()
                        .value(entity.getSigunguCode())
                        .label(entity.getName())
                        .type("SIGUNGU")
                        .active(entity.isActive())
                        .build())
                .collect(Collectors.toList());
    }
}
