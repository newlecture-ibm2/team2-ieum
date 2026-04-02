package com.ieum.user.notification.adapter.out.persistence;

import com.ieum.user.notification.application.port.out.NotificationPort;
import com.ieum.user.notification.domain.model.FcmToken;
import com.ieum.user.notification.domain.model.Notification;
import com.ieum.user.notification.domain.model.NotificationSetting;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * 알림 영속성 어댑터 (Port OUT 구현체)
 */
@Component
@RequiredArgsConstructor
public class NotificationPersistenceAdapter implements NotificationPort {

    private final NotificationJpaRepository notificationJpaRepository;
    private final FcmTokenJpaRepository fcmTokenJpaRepository;
    private final NotificationSettingJpaRepository notificationSettingJpaRepository;

    // ── Notification ──

    @Override
    public List<Notification> findByUserId(Long userId) {
        return notificationJpaRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public long countUnread(Long userId) {
        return notificationJpaRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public int markAsReadByUserId(Long userId) {
        return notificationJpaRepository.markAllAsRead(userId);
    }

    @Override
    public int markAsReadByIds(Long userId, List<Long> notificationIds) {
        return notificationJpaRepository.markAsReadByIds(userId, notificationIds);
    }

    // ── FcmToken ──

    @Override
    public Optional<FcmToken> findTokenByUserIdAndToken(Long userId, String token) {
        return fcmTokenJpaRepository.findByUserIdAndToken(userId, token);
    }

    @Override
    public FcmToken saveToken(FcmToken fcmToken) {
        return fcmTokenJpaRepository.save(fcmToken);
    }

    // ── NotificationSetting ──

    @Override
    public Optional<NotificationSetting> findSettingByUserId(Long userId) {
        return notificationSettingJpaRepository.findByUserId(userId);
    }

    @Override
    public NotificationSetting saveSetting(NotificationSetting setting) {
        return notificationSettingJpaRepository.save(setting);
    }
}
