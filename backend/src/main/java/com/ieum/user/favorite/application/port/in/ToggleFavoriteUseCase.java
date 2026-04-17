package com.ieum.user.favorite.application.port.in;

public interface ToggleFavoriteUseCase {
    void execute(String loginId, Long festivalId);
}
