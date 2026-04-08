package com.ieum.user.favorite.application.port.in;

public interface CheckFavoriteUseCase {
    boolean checkFavorite(String loginId, Long festivalId);
}
