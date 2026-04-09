package com.ieum.user.review.application.port.in;

/**
 * 리뷰 삭제 유스케이스 (Port IN)
 */
public interface DeleteReviewUseCase {

    /**
     * 본인이 작성한 리뷰를 삭제 (소프트 삭제)
     *
     * @param reviewId 리뷰 ID
     * @param loginId  로그인 사용자 ID (문자열)
     */
    void deleteReview(Long reviewId, String loginId);
}
