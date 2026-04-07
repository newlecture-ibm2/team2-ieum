package com.ieum.festival.adapter.out.persistence.repository;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface FestivalJpaRepository extends JpaRepository<FestivalEntity, Long> {
       Optional<FestivalEntity> findBySourceId(String sourceId);

       /**
        * [전체 탭] 키워드 검색 + 날짜 기반 동적 정렬
        */
       @Query("SELECT f FROM FestivalEntity f " +
                     "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
                     "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
                     "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
                     "AND (:month IS NULL OR EXTRACT(MONTH FROM f.startDate) = :month OR EXTRACT(MONTH FROM f.endDate) = :month) "
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
                     @Param("areaCode") String areaCode, @Param("month") Integer month, Pageable pageable);

       /**
        * [진행중 탭] 키워드 검색 + 오늘 날짜가 startDate~endDate 범위 안에 있는 축제만
        */
       @Query("SELECT f FROM FestivalEntity f " +
                     "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
                     "AND f.startDate <= CURRENT_DATE AND f.endDate >= CURRENT_DATE " +
                     "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
                     "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
                     "AND (:month IS NULL OR EXTRACT(MONTH FROM f.startDate) = :month OR EXTRACT(MONTH FROM f.endDate) = :month) "
                     +
                     "ORDER BY f.endDate ASC")
       Page<FestivalEntity> findOngoingFestivals(@Param("keyword") String keyword, @Param("areaCode") String areaCode,
                     @Param("month") Integer month, Pageable pageable);

       /**
        * [진행예정 탭] 키워드 검색 + 아직 시작되지 않은 축제만
        */
       @Query("SELECT f FROM FestivalEntity f " +
                     "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
                     "AND f.startDate > CURRENT_DATE " +
                     "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
                     "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
                     "AND (:month IS NULL OR EXTRACT(MONTH FROM f.startDate) = :month OR EXTRACT(MONTH FROM f.endDate) = :month) "
                     +
                     "ORDER BY f.startDate ASC")
       Page<FestivalEntity> findUpcomingFestivals(@Param("keyword") String keyword, @Param("areaCode") String areaCode,
                     @Param("month") Integer month, Pageable pageable);

       /**
        * [종료 탭] 키워드 검색 + 이미 종료된 축제만 (endDate < 오늘)
        */
       @Query("SELECT f FROM FestivalEntity f " +
                     "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
                     "AND f.endDate < CURRENT_DATE " +
                     "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
                     "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
                     "AND (:month IS NULL OR EXTRACT(MONTH FROM f.startDate) = :month OR EXTRACT(MONTH FROM f.endDate) = :month) " +
                     "ORDER BY f.endDate DESC")
       Page<FestivalEntity> findEndedFestivals(@Param("keyword") String keyword, @Param("areaCode") String areaCode,
                     @Param("month") Integer month, Pageable pageable);

       // ── 인기순 (avgRating × reviewCount DESC) ── JPQL
       @Query("SELECT f FROM FestivalEntity f " +
              "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
              "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
              "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
              "AND (:month IS NULL OR EXTRACT(MONTH FROM f.startDate) = :month OR EXTRACT(MONTH FROM f.endDate) = :month) " +
              "ORDER BY (COALESCE(f.avgRating, 0.0) * COALESCE(f.reviewCount, 0)) DESC, COALESCE(f.reviewCount, 0) DESC")
       Page<FestivalEntity> findByPopularity(@Param("keyword") String keyword,
                     @Param("areaCode") String areaCode, @Param("month") Integer month, Pageable pageable);

       // ── 조회순 (viewCount DESC) ── JPQL
       @Query("SELECT f FROM FestivalEntity f " +
              "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
              "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
              "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
              "AND (:month IS NULL OR EXTRACT(MONTH FROM f.startDate) = :month OR EXTRACT(MONTH FROM f.endDate) = :month) " +
              "ORDER BY COALESCE(f.viewCount, 0) DESC")
       Page<FestivalEntity> findByViews(@Param("keyword") String keyword,
                     @Param("areaCode") String areaCode, @Param("month") Integer month, Pageable pageable);

       // ── 거리순 (유클리드 직선거리 ASC) ── JPQL
       @Query("SELECT f FROM FestivalEntity f " +
              "WHERE (f.isVisible IS NULL OR f.isVisible = true) " +
              "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.address LIKE %:keyword%) " +
              "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
              "AND (:month IS NULL OR EXTRACT(MONTH FROM f.startDate) = :month OR EXTRACT(MONTH FROM f.endDate) = :month) " +
              "AND f.latitude IS NOT NULL AND f.longitude IS NOT NULL " +
              "ORDER BY ((f.latitude - :lat) * (f.latitude - :lat) + (f.longitude - :lng) * (f.longitude - :lng)) ASC")
       Page<FestivalEntity> findByDistance(@Param("keyword") String keyword,
                     @Param("areaCode") String areaCode, @Param("month") Integer month,
                     @Param("lat") Double lat, @Param("lng") Double lng, Pageable pageable);
}
