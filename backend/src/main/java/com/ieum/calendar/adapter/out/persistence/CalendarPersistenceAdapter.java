package com.ieum.calendar.adapter.out.persistence;

import com.ieum.calendar.application.port.out.CalendarFestivalPort;
import com.ieum.calendar.application.result.DayCountResult;
import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 달력용 축제 영속성 어댑터 (Port OUT 구현체)
 * - 월별 일자 카운트는 조회된 축제를 일자별로 집계
 */
@Component
@RequiredArgsConstructor
public class CalendarPersistenceAdapter implements CalendarFestivalPort {

    private final CalendarJpaRepository calendarJpaRepository;

    @Override
    public List<DayCountResult> countByMonth(int year, int month) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

        List<FestivalEntity> festivals = calendarJpaRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(monthEnd, monthStart);

        // 일자별 카운트 집계
        int daysInMonth = monthStart.lengthOfMonth();
        long[] counts = new long[daysInMonth + 1];

        for (FestivalEntity f : festivals) {
            int startDay = f.getStartDate().isBefore(monthStart) ? 1 : f.getStartDate().getDayOfMonth();
            int endDay = f.getEndDate().isAfter(monthEnd) ? daysInMonth : f.getEndDate().getDayOfMonth();
            for (int d = startDay; d <= endDay; d++) {
                counts[d]++;
            }
        }

        List<DayCountResult> result = new ArrayList<>();
        for (int d = 1; d <= daysInMonth; d++) {
            if (counts[d] > 0) {
                result.add(new DayCountResult(d, counts[d]));
            }
        }
        return result;
    }

    @Override
    public List<FestivalEntity> findByDate(LocalDate date) {
        return calendarJpaRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(date, date);
    }
}
