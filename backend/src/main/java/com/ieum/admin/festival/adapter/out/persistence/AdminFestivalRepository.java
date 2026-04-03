package com.ieum.admin.festival.adapter.out.persistence;

import com.ieum.admin.festival.adapter.out.persistence.entity.AdminFestivalEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 관리자 축제 전용 Repository
 * - 기준 엔티티: AdminFestivalEntity
 * - status / source 필드는 String 타입
 */
public interface AdminFestivalRepository extends JpaRepository<AdminFestivalEntity, Long> {

    // ── 공공 축제 목록 (isCustom = false) ──
    @Query("SELECT f FROM AdminFestivalEntity f WHERE f.isCustom = false " +
           "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.location LIKE %:keyword%) " +
           "AND (:status IS NULL OR f.status = :status) " +
           "AND (:category IS NULL OR f.category = :category OR f.categorySub = :category) " +
           "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
           "ORDER BY CASE " +
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
    Page<AdminFestivalEntity> searchAdminFestivals(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("category") String category,
            @Param("areaCode") String areaCode,
            Pageable pageable);

    @Query("SELECT COUNT(f) FROM AdminFestivalEntity f WHERE f.isCustom = false")
    int countPublicFestivals();

    @Query("SELECT COUNT(f) FROM AdminFestivalEntity f WHERE f.isCustom = false AND f.status = :status")
    int countPublicFestivalsByStatus(@Param("status") String status);

    java.util.Optional<AdminFestivalEntity> findBySourceId(String sourceId);

    @Query("SELECT MAX(f.apiModifiedAt) FROM AdminFestivalEntity f WHERE f.isCustom = false")
    java.util.Optional<java.time.LocalDateTime> findMaxApiModifiedAt();

    // ── 축제 등록 목록 (isCustom = true) ──
    @Query("SELECT f FROM AdminFestivalEntity f WHERE f.isCustom = true " +
           "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.location LIKE %:keyword%) " +
           "AND (:status IS NULL OR f.status = :status) " +
           "AND (:category IS NULL OR f.category = :category OR f.categorySub = :category) " +
           "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
           "ORDER BY CASE " +
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
    Page<AdminFestivalEntity> searchCustomFestivals(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("category") String category,
            @Param("areaCode") String areaCode,
            Pageable pageable);

    @Query("SELECT f FROM AdminFestivalEntity f WHERE f.isCustom = true AND f.isVisible = true " +
           "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.location LIKE %:keyword%) " +
           "AND (:status IS NULL OR f.status = :status) " +
           "AND (:category IS NULL OR f.category = :category OR f.categorySub = :category) " +
           "AND (:areaCode IS NULL OR f.areaCode = :areaCode) " +
           "ORDER BY CASE " +
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
    Page<AdminFestivalEntity> searchVisibleCustomFestivals(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("category") String category,
            @Param("areaCode") String areaCode,
            Pageable pageable);

    @Query("SELECT COUNT(f) FROM AdminFestivalEntity f WHERE f.isCustom = true")
    int countCustomFestivals();

    @Query("SELECT COUNT(f) FROM AdminFestivalEntity f WHERE f.isCustom = true AND f.status = :status")
    int countCustomFestivalsByStatus(@Param("status") String status);

    @Query("SELECT COUNT(f) FROM AdminFestivalEntity f WHERE f.isCustom = true AND f.isVisible = true")
    int countVisibleCustomFestivals();

    @Query("SELECT COUNT(f) FROM AdminFestivalEntity f WHERE f.isCustom = true AND f.isVisible = true AND f.status = :status")
    int countVisibleCustomFestivalsByStatus(@Param("status") String status);
}
