package com.ieum.user.review.application.port.in;

/**
 * 리뷰 작성 유스케이스 (Port IN)
 */
public interface CreateReviewUseCase {

    /**
     * 리뷰 작성
     *
     * @param festivalId 축제 ID
     * @param loginId    로그인 사용자 ID (문자열)
     * @param rating     평점 (1~5)
     * @param content    리뷰 내용
     */
    void createReview(Long festivalId, String loginId, Integer rating, String content);
}
