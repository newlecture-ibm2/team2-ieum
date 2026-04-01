package com.ieum.calendar.application.port.in;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;

import java.time.LocalDate;
import java.util.List;

/**
 * 일자별 축제 목록 조회 유스케이스 (API_CAL_0020)
 */
public interface GetDailyFestivalListUseCase {

    /**
     * 특정 날짜에 진행 중인 축제 목록 반환
     */
    List<FestivalEntity> getDailyFestivals(LocalDate date);
}
