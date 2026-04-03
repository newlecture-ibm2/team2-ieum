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

    /** 새로 등록되거나 갱신된 데이터 건수 */
    private int syncCount;
}
