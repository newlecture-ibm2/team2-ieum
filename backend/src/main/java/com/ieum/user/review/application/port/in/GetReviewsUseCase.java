package com.ieum.user.review.application.port.in;

import com.ieum.user.review.application.result.ReviewListResult;

/**
 * 리뷰 목록 조회 유스케이스 (Port IN)
 */
public interface GetReviewsUseCase {

    /**
     * 특정 축제의 리뷰 목록을 페이징 조회
     *
     * @param festivalId 축제 ID
     * @param page       페이지 번호 (1-based)
     * @param size       페이지 크기
     * @param sort       정렬 기준 ("latest" | "rating")
     * @return 리뷰 목록 결과
     */
    ReviewListResult getReviews(Long festivalId, int page, int size, String sort);
}
