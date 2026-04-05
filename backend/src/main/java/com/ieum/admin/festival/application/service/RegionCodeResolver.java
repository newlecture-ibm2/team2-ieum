package com.ieum.admin.festival.application.service;

import lombok.extern.slf4j.Slf4j;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 주소 텍스트에서 Tour API 지역코드(areaCode)를 역추론하는 유틸리티
 * - location / addr1 등에 포함된 시도명을 파싱하여 매핑
 * - 최신 행정구역명(전북특별자치도 등)과 구버전명(전라북도 등) 모두 대응
 */
@Slf4j
public class RegionCodeResolver {

    /**
     * 주소 키워드 → Tour API areaCode 매핑
     * - 긴 키워드(특별자치도 등)를 먼저 매칭하기 위해 LinkedHashMap 사용
     */
    private static final Map<String, String> KEYWORD_TO_CODE = new LinkedHashMap<>();

    static {
        // ── 최신 행정구역명 (우선) ──
        KEYWORD_TO_CODE.put("서울특별시",       "1");
        KEYWORD_TO_CODE.put("인천광역시",       "2");
        KEYWORD_TO_CODE.put("대전광역시",       "3");
        KEYWORD_TO_CODE.put("대구광역시",       "4");
        KEYWORD_TO_CODE.put("광주광역시",       "5");
        KEYWORD_TO_CODE.put("부산광역시",       "6");
        KEYWORD_TO_CODE.put("울산광역시",       "7");
        KEYWORD_TO_CODE.put("세종특별자치시",   "8");
        KEYWORD_TO_CODE.put("경기도",           "31");
        KEYWORD_TO_CODE.put("강원특별자치도",   "32");
        KEYWORD_TO_CODE.put("충청북도",         "33");
        KEYWORD_TO_CODE.put("충청남도",         "34");
        KEYWORD_TO_CODE.put("경상북도",         "35");
        KEYWORD_TO_CODE.put("경상남도",         "36");
        KEYWORD_TO_CODE.put("전북특별자치도",   "37");
        KEYWORD_TO_CODE.put("전라남도",         "38");
        KEYWORD_TO_CODE.put("제주특별자치도",   "39");

        // ── 구버전 / 축약 명칭 (fallback) ──
        KEYWORD_TO_CODE.put("전라북도",  "37");
        KEYWORD_TO_CODE.put("강원도",    "32");
        KEYWORD_TO_CODE.put("제주도",    "39");

        // ── 짧은 약칭 (최후 시도) ──
        KEYWORD_TO_CODE.put("서울",  "1");
        KEYWORD_TO_CODE.put("인천",  "2");
        KEYWORD_TO_CODE.put("대전",  "3");
        KEYWORD_TO_CODE.put("대구",  "4");
        KEYWORD_TO_CODE.put("광주",  "5");
        KEYWORD_TO_CODE.put("부산",  "6");
        KEYWORD_TO_CODE.put("울산",  "7");
        KEYWORD_TO_CODE.put("세종",  "8");
        KEYWORD_TO_CODE.put("경기",  "31");
        KEYWORD_TO_CODE.put("강원",  "32");
        KEYWORD_TO_CODE.put("충북",  "33");
        KEYWORD_TO_CODE.put("충남",  "34");
        KEYWORD_TO_CODE.put("경북",  "35");
        KEYWORD_TO_CODE.put("경남",  "36");
        KEYWORD_TO_CODE.put("전북",  "37");
        KEYWORD_TO_CODE.put("전남",  "38");
        KEYWORD_TO_CODE.put("제주",  "39");
    }

    /**
     * 주소 문자열에서 지역코드를 추론합니다.
     * @param address 주소 텍스트 (addr1, location 등)
     * @return areaCode (매칭 실패 시 null)
     */
    public static String resolveFromAddress(String address) {
        if (address == null || address.isBlank()) return null;

        String trimmed = address.trim();
        for (Map.Entry<String, String> entry : KEYWORD_TO_CODE.entrySet()) {
            if (trimmed.startsWith(entry.getKey()) || trimmed.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    /**
     * 카테고리 기본값 — 축제(A0207) 기본값 설정
     * Tour API의 searchFestival 엔드포인트는 행사/축제(A02) 타입만 반환하므로
     * cat1이 비어있으면 A02로 설정, cat2가 비어있으면 A0207(축제)로 설정
     */
    public static String resolveCategoryFallback(String cat, String level) {
        if (cat != null && !cat.isEmpty()) return cat;
        return switch (level) {
            case "cat1" -> "A02";    // 관광정보 > 행사/공연/축제
            case "cat2" -> "A0207";  // 행사/공연/축제 > 축제
            default -> null;
        };
    }
}
