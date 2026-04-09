package com.ieum.user.favorite.adapter.out.persistence;

import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import com.ieum.user.favorite.application.port.out.UpdateFavoriteFestivalStatsPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UpdateFavoriteFestivalStatsAdapter implements UpdateFavoriteFestivalStatsPort {

    private final FestivalJpaRepository festivalJpaRepository;

    @Override
    public void incrementFavoriteCount(Long festivalId) {
        festivalJpaRepository.findById(festivalId).ifPresent(festival -> {
            festival.setFavoriteCount(festival.getFavoriteCount() + 1);
            festivalJpaRepository.save(festival);
        });
    }

    @Override
    public void decrementFavoriteCount(Long festivalId) {
        festivalJpaRepository.findById(festivalId).ifPresent(festival -> {
            int count = festival.getFavoriteCount();
            if (count > 0) {
                festival.setFavoriteCount(count - 1);
                festivalJpaRepository.save(festival);
            }
        });
    }
}
