package com.ieum.calendar.adapter.out.persistence;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 달력용 축제 JPA 리포지토리
 * - festivals 테이블을 달력 관점에서 조회하는 쿼리 전용
 */
@Repository
public interface CalendarJpaRepository extends JpaRepository<FestivalEntity, Long> {

    /**
     * 특정 날짜에 진행 중인 축제 목록
     * (startDate <= date AND endDate >= date)
     */
    @Query("SELECT f FROM FestivalEntity f WHERE f.startDate <= :date AND f.endDate >= :date ORDER BY f.startDate ASC")
    List<FestivalEntity> findFestivalsByDate(@Param("date") LocalDate date);

    /**
     * 특정 월에 겹치는 축제 전체 조회
     * (startDate <= 월말 AND endDate >= 월초)
     */
    @Query("SELECT f FROM FestivalEntity f WHERE f.startDate <= :monthEnd AND f.endDate >= :monthStart ORDER BY f.startDate ASC")
    List<FestivalEntity> findFestivalsInMonth(@Param("monthStart") LocalDate monthStart,
                                               @Param("monthEnd") LocalDate monthEnd);
}
