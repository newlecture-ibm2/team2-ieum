package com.ieum.admin.festival.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 공공 API 기준 17개 표준 지역 코드 모음
 */
@Getter
@RequiredArgsConstructor
public enum StandardRegion {
    SEOUL("1", "서울"),
    INCHEON("2", "인천"),
    DAEJEON("3", "대전"),
    DAEGU("4", "대구"),
    GWANGJU("5", "광주"),
    BUSAN("6", "부산"),
    ULSAN("7", "울산"),
    SEJONG("8", "세종"),
    GYEONGGI("31", "경기"),
    GANGWON("32", "강원"),
    CHUNGBUK("33", "충북"),
    CHUNGNAM("34", "충남"),
    GYEONGBUK("35", "경북"),
    GYEONGNAM("36", "경남"),
    JEONBUK("37", "전북"),
    JEONNAM("38", "전남"),
    JEJU("39", "제주");

    private final String value;
    private final String label;
    private final String type = "STANDARD";
}
