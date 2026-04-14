package com.ieum.user.favorite.application.port.out;

public interface UpdateFavoriteFestivalStatsPort {
    void incrementFavoriteCount(Long festivalId);
    void decrementFavoriteCount(Long festivalId);
}
