package com.ieum.user.review.application.service;

import com.ieum.user.review.adapter.out.persistence.entity.ReviewEntity;
import com.ieum.user.review.adapter.out.persistence.repository.ReviewJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewJpaRepository repository;
    private final com.ieum.user.auth.adapter.out.persistence.repository.UserJpaRepository userJpaRepository;
    private final com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository festivalJpaRepository;

    private void updateFestivalStats(Long festivalId) {
        festivalJpaRepository.findById(festivalId).ifPresent(festival -> {
            Double avgRating = repository.getAverageRating(festivalId);
            Long reviewCount = repository.countByFestivalId(festivalId);
            festival.setAvgRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
            festival.setReviewCount(reviewCount.intValue());
            festivalJpaRepository.save(festival);
        });
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReviews(Long festivalId, int page, int size, String sort) {
        Sort sortObj = sort.equals("rating") ? Sort.by(Sort.Direction.DESC, "rating")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size, sortObj);

        Page<java.util.Map<String, Object>> reviewPage = repository.findReviewsWithNickname(festivalId, pageable);
        Double avgRating = repository.getAverageRating(festivalId);
        Long ratingCount = repository.countByFestivalId(festivalId);

        // 평점 분포 통계 (1점~5점)
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, 0L);
        }
        for (java.util.Map<String, Object> review : reviewPage.getContent()) {
            int rating = review.get("rating") != null ? (int) review.get("rating") : 0;
            ratingCounts.put(rating, ratingCounts.getOrDefault(rating, 0L) + 1L);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", reviewPage.getContent());
        response.put("totalPages", reviewPage.getTotalPages());
        response.put("totalElements", ratingCount);
        response.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.put("ratingDistribution", ratingCounts);

        return response;
    }

    @Transactional
    public ReviewEntity createReview(Long festivalId, String loginId, Integer rating, String content) {
        com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity userEntity = userJpaRepository
                .findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Long userId = user.getId();

        if (repository.existsByFestivalIdAndUserId(festivalId, userId)) {
            throw new IllegalArgumentException("이미 해당 축제에 리뷰를 작성하셨습니다.");
        }
        ReviewEntity review = ReviewEntity.builder()
                .festivalId(festivalId)
                .userId(userId)
                .rating(rating)
                .content(content)
                .build();
        ReviewEntity saved = repository.save(review);
        updateFestivalStats(festivalId);
        return saved;
    }

    @Transactional
    public ReviewEntity updateReview(Long reviewId, String loginId, Integer rating, String content) {
        com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity userEntity = userJpaRepository
                .findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ReviewEntity review = repository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getUserId().equals(user.getId()) && !user.getRole().name().contains("ADMIN")) {
            throw new IllegalArgumentException("본인의 리뷰만 수정할 수 있습니다.");
        }

        review.setRating(rating);
        review.setContent(content);

        repository.save(review);
        updateFestivalStats(review.getFestivalId());

        return review;
    }

    @Transactional
    public void deleteReview(Long reviewId, String loginId) {
        com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity userEntity = userJpaRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ReviewEntity review = repository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getUserId().equals(userEntity.getUserId()) && !userEntity.getRole().contains("ADMIN")) {
            throw new IllegalArgumentException("본인의 리뷰만 삭제할 수 있습니다.");
        }

        Long festivalId = review.getFestivalId();
        
        repository.delete(review);
        repository.flush(); // delete 반영 후 집계 쿼리 실행되도록 강제 플러시
        
        updateFestivalStats(festivalId);
    }
}
