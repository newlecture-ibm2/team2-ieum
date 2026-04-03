package com.ieum.admin.festival.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * API_ADM_0030 - 공공 축제 목록 조회 응답 중 상태 요약 (statusCounts)
 *
 * 레벨2 data.statusCounts
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FestivalStatusCountsResult {

    /** 전체 축제 개수 */
    private int total;

    /** 진행 중인 축제 개수 */
    private int ongoing;

    /** 진행 예정 축제 개수 */
    private int upcoming;

    /** 종료된 축제 개수 */
    private int ended;
}
