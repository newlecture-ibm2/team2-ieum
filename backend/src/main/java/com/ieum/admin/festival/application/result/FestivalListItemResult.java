package com.ieum.admin.festival.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * API_ADM_0030 - 공공 축제 목록 조회 응답의 축제 항목 (content 배열 원소)
 *
 * 레벨3 data.content[]
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FestivalListItemResult {

    /** 축제 고유 식별자 */
    private Long id;

    /** 축제 이름 */
    private String title;

    /** 축제 개최 지역 */
    private String region;

    /** 축제 시작일 (yyyy-MM-dd) */
    private String startDate;

    /** 축제 종료일 (yyyy-MM-dd) */
    private String endDate;

    private String category;
    private String categoryLabel;

    /** 축제 상태 (ongoing, upcoming, ended) */
    private String status;

    /** 사용자 화면 노출 여부 (true/false) */
    @com.fasterxml.jackson.annotation.JsonProperty("isVisible")
    private boolean isVisible;
}
