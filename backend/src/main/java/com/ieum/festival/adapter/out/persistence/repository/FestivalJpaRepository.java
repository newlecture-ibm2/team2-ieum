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

    @Query("SELECT f FROM FestivalEntity f WHERE (:status IS NULL OR f.status = :status) " +
           "ORDER BY CASE WHEN f.status = 'ONGOING' THEN 1 WHEN f.status = 'UPCOMING' THEN 2 ELSE 3 END ASC, f.createdAt DESC")
    Page<FestivalEntity> findFestivalsWithCustomOrder(@Param("status") String status, Pageable pageable);
}
