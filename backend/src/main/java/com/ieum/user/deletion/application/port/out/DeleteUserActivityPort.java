package com.ieum.user.deletion.application.port.out;

public interface DeleteUserActivityPort {
    void deleteFavorites(Long userId);
    void deleteLikesAndSyncCount(Long userId);
}
