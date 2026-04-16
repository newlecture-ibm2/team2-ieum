package com.ieum.festival.adapter.out.persistence.repository;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface FestivalJpaRepository extends JpaRepository<FestivalEntity, Long> {
       Optional<FestivalEntity> findBySourceId(String sourceId);

       /**
        * [전체 탭] 키워드 검색 + 날짜 기반 동적 정렬
        */
       @Query("SELECT f FROM FestivalEntity f " +
                     "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
                     "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
                     "AND (:areaCodes IS NULL OR f.areaCode IN :areaCodes) " +
                     "AND (:months IS NULL OR EXTRACT(MONTH FROM f.startDate) IN :months OR EXTRACT(MONTH FROM f.endDate) IN :months) "
                     +
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
       Page<FestivalEntity> findAllWithDynamicOrder(@Param("keyword") String keyword,
                     @Param("areaCodes") List<String> areaCodes, @Param("months") List<Integer> months, Pageable pageable);

       /**
        * [진행중 탭] 키워드 검색 + 오늘 날짜가 startDate~endDate 범위 안에 있는 축제만
        */
       @Query("SELECT f FROM FestivalEntity f " +
                     "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
                     "AND f.startDate <= CURRENT_DATE AND f.endDate >= CURRENT_DATE " +
                     "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
                     "AND (:areaCodes IS NULL OR f.areaCode IN :areaCodes) " +
                     "AND (:months IS NULL OR EXTRACT(MONTH FROM f.startDate) IN :months OR EXTRACT(MONTH FROM f.endDate) IN :months) "
                     +
                     "ORDER BY f.endDate ASC")
       Page<FestivalEntity> findOngoingFestivals(@Param("keyword") String keyword, @Param("areaCodes") List<String> areaCodes,
                     @Param("months") List<Integer> months, Pageable pageable);

       /**
        * [진행예정 탭] 키워드 검색 + 아직 시작되지 않은 축제만
        */
       @Query("SELECT f FROM FestivalEntity f " +
                     "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
                     "AND f.startDate > CURRENT_DATE " +
                     "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
                     "AND (:areaCodes IS NULL OR f.areaCode IN :areaCodes) " +
                     "AND (:months IS NULL OR EXTRACT(MONTH FROM f.startDate) IN :months OR EXTRACT(MONTH FROM f.endDate) IN :months) "
                     +
                     "ORDER BY f.startDate ASC")
       Page<FestivalEntity> findUpcomingFestivals(@Param("keyword") String keyword, @Param("areaCodes") List<String> areaCodes,
                     @Param("months") List<Integer> months, Pageable pageable);

       /**
        * [종료 탭] 키워드 검색 + 이미 종료된 축제만 (endDate < 오늘)
        */
       @Query("SELECT f FROM FestivalEntity f " +
                     "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
                     "AND f.endDate < CURRENT_DATE " +
                     "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
                     "AND (:areaCodes IS NULL OR f.areaCode IN :areaCodes) " +
                     "AND (:months IS NULL OR EXTRACT(MONTH FROM f.startDate) IN :months OR EXTRACT(MONTH FROM f.endDate) IN :months) " +
                     "ORDER BY f.endDate DESC, f.id DESC")
       Page<FestivalEntity> findEndedFestivals(@Param("keyword") String keyword, @Param("areaCodes") List<String> areaCodes,
                     @Param("months") List<Integer> months, Pageable pageable);
}
