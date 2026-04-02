package com.ieum.calendar.adapter.out.persistence;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 달력용 축제 JPA 리포지토리
 * - JPA 메서드 네이밍으로 쿼리 자동 생성
 */
@Repository
public interface CalendarJpaRepository extends JpaRepository<FestivalEntity, Long> {

    /**
     * startDate <= param1 AND endDate >= param2 인 축제 목록 (시작일 오름차순)
     * - 일자별 조회: (date, date)
     * - 월별 조회: (monthEnd, monthStart)
     */
    List<FestivalEntity> findByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(
            LocalDate startDateBound, LocalDate endDateBound);
}
