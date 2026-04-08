package com.ieum.user.notification.application.service;

import com.ieum.user.notification.application.port.in.GetMyNotificationsUseCase;
import com.ieum.user.notification.application.port.in.MarkNotificationsReadUseCase;
import com.ieum.user.notification.application.port.in.RegisterFcmTokenUseCase;
import com.ieum.user.notification.application.port.in.UpdateNotificationSettingUseCase;
import com.ieum.user.notification.application.port.in.DeleteNotificationUseCase;
import com.ieum.user.notification.application.port.out.NotificationPort;
import com.ieum.user.notification.domain.model.FcmToken;
import com.ieum.user.notification.domain.model.NotificationSetting;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 알림/FCM 서비스 (UseCase 구현체)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService implements GetMyNotificationsUseCase, RegisterFcmTokenUseCase,
        UpdateNotificationSettingUseCase, MarkNotificationsReadUseCase, DeleteNotificationUseCase {

    private final NotificationPort notificationPort;

    // ── API_USR_0040: 내 알림 목록 조회 ──

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getMyNotifications(Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("unreadCount", notificationPort.countUnread(userId));
        result.put("notifications", notificationPort.findByUserId(userId));
        return result;
    }

    // ── API_USR_0050: FCM 토큰 등록 ──

    @Override
    public void register(Long userId, String token) {
        // 이미 등록된 토큰이면 갱신(updatedAt 자동 변경), 없으면 신규 저장
        notificationPort.findTokenByUserIdAndToken(userId, token)
                .ifPresentOrElse(
                        existing -> notificationPort.saveToken(existing),
                        () -> notificationPort.saveToken(
                                FcmToken.builder()
                                        .userId(userId)
                                        .token(token)
                                        .build())
                );
    }

    // ── API_USR_0060: 알림 설정 변경 ──

    @Override
    public NotificationSetting updateSettings(Long userId, Boolean pushEnabled,
                                               Boolean festivalStart, Boolean festivalEnd,
                                               Boolean notice, Boolean comment) {
        NotificationSetting setting = notificationPort.findSettingByUserId(userId)
                .orElse(NotificationSetting.builder().userId(userId).build());

        NotificationSetting updated = NotificationSetting.builder()
                .id(setting.getId())
                .userId(setting.getUserId())
                .pushEnabled(pushEnabled != null ? pushEnabled : setting.getPushEnabled())
                .festivalStart(festivalStart != null ? festivalStart : setting.getFestivalStart())
                .festivalEnd(festivalEnd != null ? festivalEnd : setting.getFestivalEnd())
                .notice(notice != null ? notice : setting.getNotice())
                .comment(comment != null ? comment : setting.getComment())
                .updatedAt(setting.getUpdatedAt())
                .build();

        return notificationPort.saveSetting(updated);
    }

    // ── API_USR_0070: 알림 읽음 처리 ──

    @Override
    public int markAsRead(Long userId, List<Long> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) {
            return notificationPort.markAsReadByUserId(userId);
        }
        return notificationPort.markAsReadByIds(userId, notificationIds);
    }

    // ── 알림 삭제 처리 ──

    @Override
    public void deleteNotification(Long userId, Long notificationId) {
        notificationPort.deleteNotification(userId, notificationId);
    }
}
