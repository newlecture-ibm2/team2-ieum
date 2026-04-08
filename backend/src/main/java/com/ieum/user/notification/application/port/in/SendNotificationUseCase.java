package com.ieum.user.notification.application.port.in;

public interface SendNotificationUseCase {
    void sendNotification(Long targetUserId, String type, String targetType, Long targetId, String title, String message);
}
