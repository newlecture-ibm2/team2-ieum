package com.ieum.user.review.adapter.out.persistence.repository;

import com.ieum.user.review.adapter.out.persistence.entity.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewJpaRepository extends JpaRepository<ReviewEntity, Long> {
    
    Page<ReviewEntity> findByFestivalId(Long festivalId, Pageable pageable);
    
    @Query("SELECT new map(" +
           "r.id as id, " +
           "r.festivalId as festivalId, " +
           "r.userId as userId, " +
           "r.rating as rating, " +
           "r.content as content, " +
           "r.createdAt as createdAt, " +
           "r.updatedAt as updatedAt, " +
           "u.nickname as nickname, " +
           "u.role as role" +
           ") " +
           "FROM ReviewEntity r " +
           "JOIN UserJpaEntity u ON r.userId = u.id " +
           "WHERE r.festivalId = :festivalId AND r.status = 'ACTIVE'")
    Page<java.util.Map<String, Object>> findReviewsWithNickname(@Param("festivalId") Long festivalId, Pageable pageable);
    
    @Query("SELECT AVG(r.rating) FROM ReviewEntity r WHERE r.festivalId = :festivalId AND r.status = 'ACTIVE'")
    Double getAverageRating(@Param("festivalId") Long festivalId);
    
    @Query("SELECT COUNT(r) FROM ReviewEntity r WHERE r.festivalId = :festivalId AND r.status = 'ACTIVE'")
    Long countByFestivalId(@Param("festivalId") Long festivalId);
    
    boolean existsByFestivalIdAndUserId(Long festivalId, Long userId);
}
