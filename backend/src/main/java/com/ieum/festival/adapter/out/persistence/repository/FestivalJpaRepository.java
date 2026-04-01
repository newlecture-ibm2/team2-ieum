package com.ieum.festival.adapter.out.persistence.repository;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface FestivalJpaRepository extends JpaRepository<FestivalEntity, Long> {
    Optional<FestivalEntity> findBySourceId(String sourceId);

    /**
     * [전체 탭] 모든 축제를 가져오되, 날짜 기반 동적 정렬:
     *  1순위: 진행 중 (오늘이 startDate~endDate 사이)
     *  2순위: 진행 전 (startDate가 오늘 이후) → 시작일 가까운 순
     *  3순위: 종료됨 (endDate가 오늘 이전) → 최근 종료된 순
     */
    @Query("SELECT f FROM FestivalEntity f " +
           "ORDER BY " +
           "CASE " +
           "  WHEN CURRENT_DATE BETWEEN f.startDate AND f.endDate THEN 1 " +
           "  WHEN f.startDate > CURRENT_DATE THEN 2 " +
           "  ELSE 3 " +
           "END ASC, " +
           "CASE " +
           "  WHEN CURRENT_DATE BETWEEN f.startDate AND f.endDate THEN f.endDate " +
           "  WHEN f.startDate > CURRENT_DATE THEN f.startDate " +
           "  ELSE NULL " +
           "END ASC, " +
           "f.endDate DESC NULLS LAST")
    Page<FestivalEntity> findAllWithDynamicOrder(Pageable pageable);

    /**
     * [진행중 탭] 오늘 날짜가 startDate~endDate 범위 안에 있는 축제만 조회
     *  정렬: 종료일이 가까운 순 (곧 끝나는 축제 우선)
     */
    @Query("SELECT f FROM FestivalEntity f " +
           "WHERE f.startDate <= CURRENT_DATE AND f.endDate >= CURRENT_DATE " +
           "ORDER BY f.endDate ASC")
    Page<FestivalEntity> findOngoingFestivals(Pageable pageable);

    /**
     * [진행전 탭] 아직 시작되지 않은 축제만 조회
     *  정렬: 시작일이 가까운 순 (곧 시작할 축제 우선)
     */
    @Query("SELECT f FROM FestivalEntity f " +
           "WHERE f.startDate > CURRENT_DATE " +
           "ORDER BY f.startDate ASC")
    Page<FestivalEntity> findUpcomingFestivals(Pageable pageable);
}
