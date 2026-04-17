package com.ieum.user.favorite.application.port.out;

public interface LoadFavoriteUserPort {
    Long resolveUserId(String loginId);
}
