package com.ieum.user.notification.application.port.out;

import com.ieum.user.notification.domain.model.FcmToken;
import com.ieum.user.notification.domain.model.Notification;
import com.ieum.user.notification.domain.model.NotificationSetting;

import java.util.List;
import java.util.Optional;

/**
 * 알림 영속성 포트 (Port OUT)
 */
public interface NotificationPort {

    // ── Notification ──
    List<Notification> findByUserId(Long userId);
    long countUnread(Long userId);
    int markAsReadByUserId(Long userId);
    int markAsReadByIds(Long userId, List<Long> notificationIds);
    void saveAllNotifications(List<Notification> notifications);

    // ── FcmToken ──
    Optional<FcmToken> findTokenByUserIdAndToken(Long userId, String token);
    FcmToken saveToken(FcmToken fcmToken);
    List<FcmToken> findAllTokens();

    // ── NotificationSetting ──
    Optional<NotificationSetting> findSettingByUserId(Long userId);
    NotificationSetting saveSetting(NotificationSetting setting);
}
