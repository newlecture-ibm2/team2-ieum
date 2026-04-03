package com.ieum.festival.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 축제 등록 등 표준 공공 API 지역 코드 외의 커스텀 지역 코드 (최대 10자)
 */
@Getter
@RequiredArgsConstructor
public enum CustomRegion {
    ALL("전국"),
    ONLINE("온라인"),
    UNDECIDED("미정");

    private final String label;
    private final String type = "CUSTOM";

    public String getValue() {
        return this.name();
    }
}
