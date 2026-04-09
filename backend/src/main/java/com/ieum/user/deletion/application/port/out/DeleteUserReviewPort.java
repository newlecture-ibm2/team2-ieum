package com.ieum.user.deletion.application.port.out;

public interface DeleteUserReviewPort {
    void deleteReviewsAndRecalculateStats(Long userId);
}
