package com.ieum.admin.festival.adapter.in.web.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * API_ADM_0032 - 축제 노출/숨김 수정 요청 (RequestBody)
 *
 * PATCH /api/admin/festivals/{festivalId}/visibility
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FestivalVisibilityRequest {

    @Schema(description = "변경할 노출 상태 (true: 공개, false: 숨김)", example = "true")
    @com.fasterxml.jackson.annotation.JsonProperty("isVisible")
    private boolean isVisible;
}
