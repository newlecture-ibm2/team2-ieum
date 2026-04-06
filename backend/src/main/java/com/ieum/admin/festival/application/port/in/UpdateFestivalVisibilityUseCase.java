package com.ieum.admin.festival.application.port.in;

import com.ieum.admin.festival.application.result.FestivalVisibilityResult;

/**
 * 축제 노출/숨김 변경 유스케이스 (API_ADM_0032)
 */
public interface UpdateFestivalVisibilityUseCase {

    FestivalVisibilityResult updateVisibility(Long festivalId, boolean isVisible);
}
