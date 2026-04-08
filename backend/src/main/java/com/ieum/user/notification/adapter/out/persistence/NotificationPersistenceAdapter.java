package com.ieum.user.notification.adapter.out.persistence;

import com.ieum.user.notification.adapter.out.persistence.entity.FcmTokenJpaEntity;
import com.ieum.user.notification.adapter.out.persistence.entity.NotificationJpaEntity;
import com.ieum.user.notification.adapter.out.persistence.entity.NotificationSettingJpaEntity;
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
        return notificationJpaRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationJpaEntity::toDomain)
                .toList();
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

    @Override
    public void saveAllNotifications(List<Notification> notifications) {
        List<NotificationJpaEntity> entities = notifications.stream()
                .map(NotificationJpaEntity::fromDomain)
                .toList();
        notificationJpaRepository.saveAll(entities);
    }

    @Override
    public void deleteNotification(Long userId, Long notificationId) {
        notificationJpaRepository.deleteByUserIdAndId(userId, notificationId);
    }

    // ── FcmToken ──

    @Override
    public Optional<FcmToken> findTokenByUserIdAndToken(Long userId, String token) {
        return fcmTokenJpaRepository.findByUserIdAndToken(userId, token)
                .map(FcmTokenJpaEntity::toDomain);
    }

    @Override
    public FcmToken saveToken(FcmToken fcmToken) {
        FcmTokenJpaEntity entity = FcmTokenJpaEntity.fromDomain(fcmToken);
        return fcmTokenJpaRepository.save(entity).toDomain();
    }

    @Override
    public List<FcmToken> findAllTokens() {
        return fcmTokenJpaRepository.findAll().stream()
                .map(FcmTokenJpaEntity::toDomain)
                .toList();
    }

    // ── NotificationSetting ──

    @Override
    public Optional<NotificationSetting> findSettingByUserId(Long userId) {
        return notificationSettingJpaRepository.findByUserId(userId)
                .map(NotificationSettingJpaEntity::toDomain);
    }

    @Override
    public NotificationSetting saveSetting(NotificationSetting setting) {
        NotificationSettingJpaEntity entity = NotificationSettingJpaEntity.fromDomain(setting);
        return notificationSettingJpaRepository.save(entity).toDomain();
    }
}
