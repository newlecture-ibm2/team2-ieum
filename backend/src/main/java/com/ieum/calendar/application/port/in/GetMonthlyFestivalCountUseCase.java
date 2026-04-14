package com.ieum.calendar.application.port.in;

import com.ieum.calendar.application.result.DayCountResult;

import java.util.List;

/**
 * 월별 축제 카운트 조회 유스케이스 (API_CAL_0010)
 */
public interface GetMonthlyFestivalCountUseCase {

    /**
     * 특정 연/월에 해당하는 일자별 축제 개수 반환
     */
    List<DayCountResult> getMonthlyCounts(int year, int month);
}
