package com.ieum.user.notification.application.port.in;

public interface DeleteNotificationUseCase {
    void deleteNotification(Long userId, Long notificationId);
}
