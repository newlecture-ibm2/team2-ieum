package com.ieum.user.review.application.port.out;

/**
 * 축제 통계 업데이트 포트 (Port OUT)
 * - Review 모듈이 Festival 모듈의 adapter를 직접 참조하지 않도록 중재
 */
public interface UpdateFestivalStatsPort {

    /**
     * 축제의 평균 평점과 리뷰 수를 갱신
     *
     * @param festivalId  축제 ID
     * @param avgRating   새 평균 평점
     * @param reviewCount 새 리뷰 수
     */
    void updateStats(Long festivalId, Double avgRating, Integer reviewCount);
}
