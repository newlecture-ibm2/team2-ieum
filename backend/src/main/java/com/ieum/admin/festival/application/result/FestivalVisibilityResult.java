package com.ieum.admin.festival.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * API_ADM_0032 - 축제 노출/숨김 수정 응답 (data 본문)
 *
 * PATCH /api/admin/festivals/{festivalId}/visibility
 * 변경 후 상태를 반환한다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FestivalVisibilityResult {

    /** 처리 상태 (예: UPDATED - 수정 완료) */
    private String status;

    /** 변경 완료된 노출 상태값 */
    private boolean current;
}
