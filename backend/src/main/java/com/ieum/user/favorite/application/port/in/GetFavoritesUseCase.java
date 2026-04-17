package com.ieum.user.favorite.application.port.in;

import com.ieum.user.favorite.application.result.FavoriteListResult;

public interface GetFavoritesUseCase {
    FavoriteListResult getFavorites(String loginId, int page, int size);
}
