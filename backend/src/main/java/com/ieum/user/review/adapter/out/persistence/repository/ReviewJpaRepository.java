package com.ieum.user.review.adapter.out.persistence.repository;

import com.ieum.user.review.adapter.out.persistence.entity.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewJpaRepository extends JpaRepository<ReviewEntity, Long> {
    
    Page<ReviewEntity> findByFestivalId(Long festivalId, Pageable pageable);
    
    @Query("SELECT AVG(r.rating) FROM ReviewEntity r WHERE r.festivalId = :festivalId")
    Double getAverageRating(@Param("festivalId") Long festivalId);
    
    @Query("SELECT COUNT(r) FROM ReviewEntity r WHERE r.festivalId = :festivalId")
    Long countByFestivalId(@Param("festivalId") Long festivalId);
    
    boolean existsByFestivalIdAndUserId(Long festivalId, Long userId);
}
