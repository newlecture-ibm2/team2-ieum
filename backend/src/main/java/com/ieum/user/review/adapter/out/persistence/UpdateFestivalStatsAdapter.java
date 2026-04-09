package com.ieum.user.review.adapter.out.persistence;

import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import com.ieum.user.review.application.port.out.UpdateFestivalStatsPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 축제 통계 업데이트 어댑터 (Output Adapter)
 * - Review 모듈의 UpdateFestivalStatsPort를 구현
 * - Festival 모듈의 JpaRepository에 대한 의존성을 여기(adapter 계층)에서만 갖음
 */
@Component
@RequiredArgsConstructor
public class UpdateFestivalStatsAdapter implements UpdateFestivalStatsPort {

    private final FestivalJpaRepository festivalJpaRepository;

    @Override
    public void updateStats(Long festivalId, Double avgRating, Integer reviewCount) {
        festivalJpaRepository.findById(festivalId).ifPresent(festival -> {
            festival.setAvgRating(avgRating);
            festival.setReviewCount(reviewCount);
            festivalJpaRepository.save(festival);
        });
    }
}
