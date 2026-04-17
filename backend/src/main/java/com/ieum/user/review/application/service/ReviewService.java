package com.ieum.user.review.application.service;

import com.ieum.global.common.PagedResult;
import com.ieum.user.review.application.port.in.CreateReviewUseCase;
import com.ieum.user.review.application.port.in.DeleteReviewUseCase;
import com.ieum.user.review.application.port.in.GetReviewsUseCase;
import com.ieum.user.review.application.port.in.UpdateReviewUseCase;
import com.ieum.user.review.application.port.out.LoadReviewUserPort;
import com.ieum.user.review.application.port.out.ReviewPersistencePort;
import com.ieum.user.review.application.port.out.UpdateFestivalStatsPort;
import com.ieum.user.auth.application.port.in.CheckUserSuspensionUseCase;
import com.ieum.user.review.application.result.ReviewListResult;
import com.ieum.user.review.domain.model.Review;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 리뷰 서비스 (UseCase 구현체)
 * - Port IN 인터페이스를 구현
 * - Port OUT 인터페이스에만 의존 (adapter 직접 참조 없음)
 * - 비즈니스 로직은 도메인 모델(Review)에 위임
 *
 * ✅ Spring Data 타입(Page, Pageable, Sort, PageRequest) 의존 제거
 *    - 정렬/페이징 파라미터는 primitive로 전달하고 Adapter에서 변환
 */
@Service
@RequiredArgsConstructor
public class ReviewService implements GetReviewsUseCase, CreateReviewUseCase,
                                       UpdateReviewUseCase, DeleteReviewUseCase {

    private final ReviewPersistencePort reviewPersistencePort;
    private final LoadReviewUserPort loadReviewUserPort;
    private final UpdateFestivalStatsPort updateFestivalStatsPort;
    private final CheckUserSuspensionUseCase checkUserSuspensionUseCase;

    /**
     * 정지 회원 검증 — WRITE 작업 전 호출
     */
    private void validateNotSuspended(Long userId) {
        if (userId != null && checkUserSuspensionUseCase.isSuspended(userId)) {
            throw new BusinessException(ErrorCode.USER_001,
                    "Suspended user attempted review operation. userId=" + userId);
        }
    }

    // ── 리뷰 목록 조회 ──

    @Override
    @Transactional(readOnly = true)
<<<<<<< HEAD
    public Map<String, Object> getReviews(Long festivalId, int page, int size, String sort) {
        Sort sortObj = sort.equals("rating") ? Sort.by(Sort.Direction.DESC, "rating")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size, sortObj);

        Page<java.util.Map<String, Object>> reviewPage = repository.findReviewsWithNickname(festivalId, pageable);
        Double avgRating = repository.getAverageRating(festivalId);
        Long ratingCount = repository.countByFestivalId(festivalId);

        // 평점 분포 통계 (1점~5점)
        Map<Integer, Long> ratingCounts = new HashMap<>();
=======
    public ReviewListResult getReviews(Long festivalId, int page, int size, String sort) {
        // 정렬 조건을 primitive 값으로 결정 (프레임워크 독립)
        String sortField = "rating".equals(sort) ? "rating" : "createdAt";
        String sortDirection = "DESC";
        int zeroBasedPage = page > 0 ? page - 1 : 0;

        PagedResult<Review> reviewPage = reviewPersistencePort.findActiveReviewsByFestivalId(
                festivalId, zeroBasedPage, size, sortField, sortDirection);
        Double avgRating = reviewPersistencePort.getAverageRating(festivalId);
        Long totalCount = reviewPersistencePort.countActiveByFestivalId(festivalId);

        // 평점 분포 통계 (현재 페이지 기반)
        Map<Integer, Long> ratingDistribution = new HashMap<>();
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
        for (int i = 1; i <= 5; i++) {
            ratingDistribution.put(i, 0L);
        }
        for (Review review : reviewPage.getContent()) {
            int rating = review.getRating() != null ? review.getRating() : 0;
            ratingDistribution.put(rating, ratingDistribution.getOrDefault(rating, 0L) + 1L);
        }

<<<<<<< HEAD
        Map<String, Object> response = new HashMap<>();
        response.put("content", reviewPage.getContent());
        response.put("totalPages", reviewPage.getTotalPages());
        response.put("totalElements", ratingCount);
        response.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.put("ratingDistribution", ratingCounts);

        return response;
=======
        List<ReviewListResult.ReviewItem> items = reviewPage.getContent().stream()
                .map(ReviewListResult.ReviewItem::from)
                .collect(Collectors.toList());

        double avg = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;

        return new ReviewListResult(items, reviewPage.getTotalPages(), totalCount, avg, ratingDistribution);
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
    }

    // ── 리뷰 작성 ──

    @Override
    @Transactional
<<<<<<< HEAD
    public ReviewEntity createReview(Long festivalId, String loginId, Integer rating, String content) {
        com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity userEntity = userJpaRepository
                .findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Long userId = userEntity.getUserId();

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
=======
    public void createReview(Long festivalId, String loginId, Integer rating, String content) {
        Long userId = loadReviewUserPort.resolveUserId(loginId);
        validateNotSuspended(userId);

        // 도메인 모델에서 생성 + 검증
        Review review = Review.create(userId, festivalId, rating, content);
        reviewPersistencePort.save(review);

        recalculateFestivalStats(festivalId);
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
    }

    // ── 리뷰 수정 ──

    @Override
    @Transactional
<<<<<<< HEAD
    public ReviewEntity updateReview(Long reviewId, String loginId, Integer rating, String content) {
        com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity userEntity = userJpaRepository
                .findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ReviewEntity review = repository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getUserId().equals(userEntity.getUserId()) && !userEntity.getRole().contains("ADMIN")) {
            throw new IllegalArgumentException("본인의 리뷰만 수정할 수 있습니다.");
        }

        review.setRating(rating);
        review.setContent(content);

        repository.save(review);
        updateFestivalStats(review.getFestivalId());

        return review;
=======
    public void updateReview(Long reviewId, String loginId, Integer rating, String content) {
        Long userId = loadReviewUserPort.resolveUserId(loginId);
        validateNotSuspended(userId);

        Review review = reviewPersistencePort.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 도메인 모델의 비즈니스 메서드로 검증 + 수정
        review.update(userId, rating, content);
        reviewPersistencePort.save(review);

        recalculateFestivalStats(review.getFestivalId());
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
    }

    // ── 리뷰 삭제 ──

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String loginId) {
<<<<<<< HEAD
        com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity userEntity = userJpaRepository
                .findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ReviewEntity review = repository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getUserId().equals(userEntity.getUserId()) && !userEntity.getRole().contains("ADMIN")) {
            throw new IllegalArgumentException("본인의 리뷰만 삭제할 수 있습니다.");
        }
        repository.delete(review);
        repository.flush(); // delete 반영 후 집계 쿼리 실행되도록 강제 플러시
        updateFestivalStats(review.getFestivalId());
=======
        Long userId = loadReviewUserPort.resolveUserId(loginId);
        validateNotSuspended(userId);

        Review review = reviewPersistencePort.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 도메인 모델의 비즈니스 메서드로 검증 + 소프트 삭제
        review.softDelete(userId);
        reviewPersistencePort.save(review);

        recalculateFestivalStats(review.getFestivalId());
    }

    // ── 축제 통계 재계산 (private) ──

    private void recalculateFestivalStats(Long festivalId) {
        Double avgRating = reviewPersistencePort.getAverageRating(festivalId);
        Long reviewCount = reviewPersistencePort.countActiveByFestivalId(festivalId);

        double avg = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;
        updateFestivalStatsPort.updateStats(festivalId, avg, reviewCount.intValue());
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
    }
}