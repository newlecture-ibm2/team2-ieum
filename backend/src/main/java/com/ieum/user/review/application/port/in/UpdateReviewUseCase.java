package com.ieum.user.review.application.port.in;

/**
 * 리뷰 수정 유스케이스 (Port IN)
 */
public interface UpdateReviewUseCase {

    /**
     * 본인이 작성한 리뷰를 수정
     *
     * @param reviewId 리뷰 ID
     * @param loginId  로그인 사용자 ID (문자열)
     * @param rating   새 평점 (1~5)
     * @param content  새 리뷰 내용
     */
    void updateReview(Long reviewId, String loginId, Integer rating, String content);
}
