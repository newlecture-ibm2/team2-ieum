package com.ieum.user.review.adapter.out.persistence;

import com.ieum.global.common.PagedResult;
import com.ieum.user.review.adapter.out.persistence.entity.ReviewEntity;
import com.ieum.user.review.adapter.out.persistence.repository.ReviewJpaRepository;
import com.ieum.user.review.application.port.out.ReviewPersistencePort;
import com.ieum.user.review.domain.model.Review;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 리뷰 영속성 어댑터 (Output Adapter)
 * - JPA Repository를 감싸서 Port OUT 구현
 * - Entity ↔ Domain 매핑 담당
 * - Spring Data Page → PagedResult 변환 담당
 */
@Component
@RequiredArgsConstructor
public class ReviewPersistenceAdapter implements ReviewPersistencePort {

    private final ReviewJpaRepository repository;

    @Override
    public Review save(Review review) {
        ReviewEntity entity;

        if (review.getId() != null) {
            entity = repository.findById(review.getId())
                    .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
            entity.setRating(review.getRating());
            entity.setContent(review.getContent());
            entity.setStatus(review.getStatus());
        } else {
            entity = ReviewEntity.builder()
                    .userId(review.getUserId())
                    .festivalId(review.getFestivalId())
                    .rating(review.getRating())
                    .content(review.getContent())
                    .status(review.getStatus())
                    .build();
        }

        ReviewEntity saved = repository.save(entity);
        return toDomain(saved, null, null);
    }

    @Override
    public Optional<Review> findById(Long reviewId) {
        return repository.findById(reviewId)
                .map(entity -> toDomain(entity, null, null));
    }

    @Override
    public PagedResult<Review> findActiveReviewsByFestivalId(Long festivalId, int page, int size,
                                                              String sortField, String sortDirection) {
        // Adapter 내부에서 Spring Data 타입 생성 (Port 경계 밖)
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<java.util.Map<String, Object>> entityPage = repository.findReviewsWithNickname(festivalId, pageable);

        List<Review> reviews = entityPage.getContent().stream()
                .map(row -> Review.reconstitute(
                        toLong(row.get("id")),
                        toLong(row.get("userId")),
                        festivalId,
                        (Integer) row.get("rating"),
                        (String) row.get("content"),
                        "ACTIVE",
                        (String) row.get("nickname"),
                        row.get("role") != null ? row.get("role").toString() : null,
                        (java.time.LocalDateTime) row.get("createdAt"),
                        (java.time.LocalDateTime) row.get("updatedAt")
                ))
                .collect(Collectors.toList());

        return new PagedResult<>(reviews, entityPage.getTotalElements(), entityPage.getTotalPages());
    }

    @Override
    public Double getAverageRating(Long festivalId) {
        return repository.getAverageRating(festivalId);
    }

    @Override
    public Long countActiveByFestivalId(Long festivalId) {
        return repository.countByFestivalId(festivalId);
    }

    @Override
    public boolean existsByFestivalIdAndUserId(Long festivalId, Long userId) {
        return repository.existsByFestivalIdAndUserId(festivalId, userId);
    }

    // ── Entity → Domain 매핑 ──

    private Review toDomain(ReviewEntity entity, String nickname, String role) {
        return Review.reconstitute(
                entity.getId(),
                entity.getUserId(),
                entity.getFestivalId(),
                entity.getRating(),
                entity.getContent(),
                entity.getStatus(),
                nickname,
                role,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        return Long.valueOf(value.toString());
    }
}
