package com.ieum.festival.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CustomCategory {
    LOCAL("지역축제"),
    SCHOOL("대학축제"),
    COMPANY("기업행사"),
    ONLINE("온라인행사"),
    ETC("기타");

    private final String label;
}
