package com.ieum.admin.festival.application.port.in;

import com.ieum.admin.festival.application.result.AdminFestivalListResult;

/**
 * 관리자용 공공 축제 목록 조회 유스케이스 (API_ADM_0030)
 */
public interface GetAdminFestivalListUseCase {

    AdminFestivalListResult getFestivals(int page, int size, String keyword, String status, String categoryCode, String areaCode);
}
