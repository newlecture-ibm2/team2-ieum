package com.ieum.user.notification.application.port.in;

public interface SystemNotificationUseCase {
    void sendNoticeNotification(Long noticeId, String title, String summary);
}
