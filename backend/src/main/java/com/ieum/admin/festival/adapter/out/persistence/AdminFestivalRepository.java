package com.ieum.admin.festival.adapter.out.persistence;

import com.ieum.festival.domain.model.Festival;
import com.ieum.festival.domain.model.FestivalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminFestivalRepository extends JpaRepository<Festival, Long> {

    @Query("SELECT f FROM Festival f WHERE f.isCustom = false " +
           "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.location LIKE %:keyword%) " +
           "AND (:status IS NULL OR f.status = :status) " +
           "ORDER BY CASE f.status " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.ONGOING THEN 1 " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.UPCOMING THEN 2 " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.ENDED THEN 3 ELSE 4 END ASC, " +
           "f.createdAt DESC")
    Page<Festival> searchAdminFestivals(
            @Param("keyword") String keyword,
            @Param("status") FestivalStatus status,
            Pageable pageable);

    @Query("SELECT COUNT(f) FROM Festival f WHERE f.isCustom = false")
    int countPublicFestivals();

    @Query("SELECT COUNT(f) FROM Festival f WHERE f.isCustom = false AND f.status = :status")
    int countPublicFestivalsByStatus(@Param("status") FestivalStatus status);

    java.util.Optional<Festival> findBySourceId(String sourceId);

    @Query("SELECT MAX(f.apiModifiedAt) FROM Festival f WHERE f.isCustom = false")
    java.util.Optional<java.time.LocalDateTime> findMaxApiModifiedAt();

    @Query("SELECT f FROM Festival f WHERE f.isCustom = true " +
           "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.location LIKE %:keyword%) " +
           "AND (:status IS NULL OR f.status = :status) " +
           "ORDER BY CASE f.status " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.ONGOING THEN 1 " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.UPCOMING THEN 2 " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.ENDED THEN 3 ELSE 4 END ASC, " +
           "f.createdAt DESC")
    Page<Festival> searchCustomFestivals(
            @Param("keyword") String keyword,
            @Param("status") FestivalStatus status,
            Pageable pageable);

    @Query("SELECT f FROM Festival f WHERE f.isCustom = true AND f.isVisible = true " +
           "AND (:keyword IS NULL OR f.title LIKE %:keyword% OR f.location LIKE %:keyword%) " +
           "AND (:status IS NULL OR f.status = :status) " +
           "ORDER BY CASE f.status " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.ONGOING THEN 1 " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.UPCOMING THEN 2 " +
           "WHEN com.ieum.festival.domain.model.FestivalStatus.ENDED THEN 3 ELSE 4 END ASC, " +
           "f.createdAt DESC")
    Page<Festival> searchVisibleCustomFestivals(
            @Param("keyword") String keyword,
            @Param("status") FestivalStatus status,
            Pageable pageable);

    @Query("SELECT COUNT(f) FROM Festival f WHERE f.isCustom = true")
    int countCustomFestivals();

    @Query("SELECT COUNT(f) FROM Festival f WHERE f.isCustom = true AND f.status = :status")
    int countCustomFestivalsByStatus(@Param("status") FestivalStatus status);

    @Query("SELECT COUNT(f) FROM Festival f WHERE f.isCustom = true AND f.isVisible = true")
    int countVisibleCustomFestivals();

    @Query("SELECT COUNT(f) FROM Festival f WHERE f.isCustom = true AND f.isVisible = true AND f.status = :status")
    int countVisibleCustomFestivalsByStatus(@Param("status") FestivalStatus status);
}
