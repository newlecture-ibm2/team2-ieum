package com.ieum.admin.festival.application.port.in;

import com.ieum.admin.festival.application.result.CustomFestivalListResult;

/**
 * 관리자용 축제 등록 목록 조회 유스케이스 (API_ADM_0040)
 */
public interface GetCustomFestivalListUseCase {

    CustomFestivalListResult getCustomFestivals(int page, int size, String keyword, String status, String categoryCode, String areaCode, boolean excludeHidden);
}
