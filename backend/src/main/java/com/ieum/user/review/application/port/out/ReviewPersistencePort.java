package com.ieum.user.review.application.port.out;

import com.ieum.user.review.domain.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 리뷰 영속성 포트 (Port OUT)
 * - Application 계층이 이 인터페이스에 의존
 * - adapter.out.persistence 에서 구현
 */
public interface ReviewPersistencePort {

    /**
     * 리뷰 저장 (생성 / 수정)
     */
    Review save(Review review);

    /**
     * ID로 리뷰 조회
     */
    Optional<Review> findById(Long reviewId);

    /**
     * 특정 축제의 활성 리뷰 목록 (닉네임 포함) 페이징 조회
     */
    Page<Review> findActiveReviewsByFestivalId(Long festivalId, Pageable pageable);

    /**
     * 특정 축제의 활성 리뷰 평균 평점
     */
    Double getAverageRating(Long festivalId);

    /**
     * 특정 축제의 활성 리뷰 수
     */
    Long countActiveByFestivalId(Long festivalId);

    /**
     * 중복 리뷰 존재 여부
     */
    boolean existsByFestivalIdAndUserId(Long festivalId, Long userId);
}
