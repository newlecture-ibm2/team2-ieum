package com.ieum.festival.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StandardCategory {
    A02070100("문화관광축제"),
    A02070200("일반축제"),
    A02080100("전통공연/예술"),
    A02080200("연극"),
    A02080300("뮤지컬"),
    A02080400("오페라"),
    A02080500("전시/미술"),
    A02080600("박람회"),
    A02081300("대중공연"),
    A02080700("기타행사"),
    A02("인문(문화/예술/역사)"),
    A0207("축제"),
    A0208("공연/행사");

    private final String label;
}
