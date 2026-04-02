package com.ieum.calendar.application.service;

import com.ieum.calendar.application.port.in.GetDailyFestivalListUseCase;
import com.ieum.calendar.application.port.in.GetMonthlyFestivalCountUseCase;
import com.ieum.calendar.application.port.out.CalendarFestivalPort;
import com.ieum.calendar.application.result.DayCountResult;
import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 달력 서비스 (UseCase 구현체)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService implements GetMonthlyFestivalCountUseCase, GetDailyFestivalListUseCase {

    private final CalendarFestivalPort calendarFestivalPort;

    @Override
    public List<DayCountResult> getMonthlyCounts(int year, int month) {
        return calendarFestivalPort.countByMonth(year, month);
    }

    @Override
    public List<FestivalEntity> getDailyFestivals(LocalDate date) {
        return calendarFestivalPort.findByDate(date);
    }
}
