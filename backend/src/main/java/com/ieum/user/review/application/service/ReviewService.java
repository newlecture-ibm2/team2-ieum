package com.ieum.user.review.application.service;

import com.ieum.global.common.PagedResult;
import com.ieum.user.review.application.port.in.CreateReviewUseCase;
import com.ieum.user.review.application.port.in.DeleteReviewUseCase;
import com.ieum.user.review.application.port.in.GetReviewsUseCase;
import com.ieum.user.review.application.port.in.UpdateReviewUseCase;
import com.ieum.user.review.application.port.out.LoadReviewUserPort;
import com.ieum.user.review.application.port.out.ReviewPersistencePort;
import com.ieum.user.review.application.port.out.UpdateFestivalStatsPort;
import com.ieum.user.review.application.port.out.UserSuspensionCheckPort;
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
    private final UserSuspensionCheckPort userSuspensionCheckPort;

    /**
     * 정지 회원 검증 — WRITE 작업 전 호출
     */
    private void validateNotSuspended(Long userId) {
        if (userId != null && userSuspensionCheckPort.isSuspended(userId)) {
            throw new BusinessException(ErrorCode.USER_001,
                    "Suspended user attempted review operation. userId=" + userId);
        }
    }

    // ── 리뷰 목록 조회 ──

    @Override
    @Transactional(readOnly = true)
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
        for (int i = 1; i <= 5; i++) {
            ratingDistribution.put(i, 0L);
        }
        for (Review review : reviewPage.getContent()) {
            int rating = review.getRating() != null ? review.getRating() : 0;
            ratingDistribution.put(rating, ratingDistribution.getOrDefault(rating, 0L) + 1L);
        }

        List<ReviewListResult.ReviewItem> items = reviewPage.getContent().stream()
                .map(ReviewListResult.ReviewItem::from)
                .collect(Collectors.toList());

        double avg = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;

        return new ReviewListResult(items, reviewPage.getTotalPages(), totalCount, avg, ratingDistribution);
    }

    // ── 리뷰 작성 ──

    @Override
    @Transactional
    public void createReview(Long festivalId, String loginId, Integer rating, String content) {
        Long userId = loadReviewUserPort.resolveUserId(loginId);
        validateNotSuspended(userId);

        // 도메인 모델에서 생성 + 검증
        Review review = Review.create(userId, festivalId, rating, content);
        reviewPersistencePort.save(review);

        recalculateFestivalStats(festivalId);
    }

    // ── 리뷰 수정 ──

    @Override
    @Transactional
    public void updateReview(Long reviewId, String loginId, Integer rating, String content) {
        Long userId = loadReviewUserPort.resolveUserId(loginId);
        validateNotSuspended(userId);

        Review review = reviewPersistencePort.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 도메인 모델의 비즈니스 메서드로 검증 + 수정
        review.update(userId, rating, content);
        reviewPersistencePort.save(review);

        recalculateFestivalStats(review.getFestivalId());
    }

    // ── 리뷰 삭제 ──

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String loginId) {
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
    }
}
