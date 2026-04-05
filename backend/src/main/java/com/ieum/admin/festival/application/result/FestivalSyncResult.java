package com.ieum.admin.festival.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * API_ADM_0031 - 데이터 수동 동기화 응답 (data 본문)
 *
 * POST /api/admin/festivals/sync
 * 동기화 처리 결과를 반환한다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FestivalSyncResult {

    /** 처리 상태 (예: COMPLETED - 동기화 완료) */
    private String status;

    /** 새로 등록되거나 갱신된 축제 데이터 건수 */
    private int syncCount;

    /** 마스터 데이터(지역) 동기화 건수 */
    @Builder.Default
    private int masterRegionCount = 0;

    /** 마스터 데이터(카테고리) 동기화 건수 */
    @Builder.Default
    private int masterCategoryCount = 0;

    /** 마스터 데이터(시군구) 동기화 건수 */
    @Builder.Default
    private int masterSigunguCount = 0;
}
