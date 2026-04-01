package com.ieum.calendar.application.port.out;

import com.ieum.calendar.application.result.DayCountResult;
import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;

import java.time.LocalDate;
import java.util.List;

/**
 * 달력용 축제 조회 포트 (Port OUT)
 * - festivals 테이블을 달력 관점에서 조회
 */
public interface CalendarFestivalPort {

    /**
     * 월별 일자 카운트 (해당 월에 진행 중인 축제를 일자별로 집계)
     */
    List<DayCountResult> countByMonth(int year, int month);

    /**
     * 특정 날짜에 진행 중인 축제 목록
     */
    List<FestivalEntity> findByDate(LocalDate date);
}
