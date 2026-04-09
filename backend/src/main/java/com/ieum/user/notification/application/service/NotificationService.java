package com.ieum.user.notification.application.service;

import com.ieum.user.notification.adapter.in.web.dto.NotificationListResponse;
import com.ieum.user.notification.application.port.in.GetMyNotificationsUseCase;
import com.ieum.user.notification.application.port.in.MarkNotificationsReadUseCase;
import com.ieum.user.notification.application.port.in.RegisterFcmTokenUseCase;
import com.ieum.user.notification.application.port.in.UpdateNotificationSettingUseCase;
import com.ieum.user.notification.application.port.in.DeleteNotificationUseCase;
import com.ieum.user.notification.application.port.in.SendNotificationUseCase;
import com.ieum.user.notification.application.port.out.FcmPort;
import com.ieum.user.notification.application.port.out.NotificationPort;
import com.ieum.user.notification.domain.model.FcmToken;
import com.ieum.user.notification.domain.model.Notification;
import com.ieum.user.notification.domain.model.NotificationSetting;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 알림/FCM 서비스 (UseCase 구현체)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService implements GetMyNotificationsUseCase, RegisterFcmTokenUseCase,
        UpdateNotificationSettingUseCase, MarkNotificationsReadUseCase, DeleteNotificationUseCase, SendNotificationUseCase {

    private final NotificationPort notificationPort;
    private final FcmPort fcmPort;

    // ── API_USR_0040: 내 알림 목록 조회 ──

    @Override
    @Transactional(readOnly = true)
    public NotificationListResponse getMyNotifications(Long userId) {
        long unreadCount = notificationPort.countUnread(userId);
        List<Notification> notifications = notificationPort.findByUserId(userId);
        return new NotificationListResponse(unreadCount, notifications);
    }

    // ── API_USR_0050: FCM 토큰 등록 ──

    @Override
    public void register(Long userId, String token) {
        // 토큰 유효성 검증 (컨트롤러에서 이동)
        if (token == null || token.isBlank()) {
            return;
        }
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

    // ── 개별 알림 단건 전송 ──

    @Override
    public void sendNotification(Long targetUserId, String type, String targetType, Long targetId, String title, String message) {
        log.info("개별 사용자 알림 전송: targetUserId={}, type={}, title={}", targetUserId, type, title);

        // 1. 알림 설정 확인
        NotificationSetting setting = notificationPort.findSettingByUserId(targetUserId).orElse(null);
        boolean isPushEnabled = true;

        if (setting != null) {
            if (Boolean.FALSE.equals(setting.getPushEnabled())) {
                isPushEnabled = false;
            } else {
                // 타입별 세부 설정 확인
                if ("COMMENT".equals(type) && Boolean.FALSE.equals(setting.getComment())) {
                    isPushEnabled = false;
                } else if ("FESTIVAL_START".equals(type) && Boolean.FALSE.equals(setting.getFestivalStart())) {
                    isPushEnabled = false;
                } else if ("FESTIVAL_END".equals(type) && Boolean.FALSE.equals(setting.getFestivalEnd())) {
                    isPushEnabled = false;
                }
            }
        }

        if (!isPushEnabled) {
            log.debug("사용자 {} 알림 설정(off)으로 인해 발송 제외", targetUserId);
            return;
        }

        // 2. DB 알림 생성
        Notification notification = Notification.builder()
                .userId(targetUserId)
                .type(type)
                .message(message)
                .targetType(targetType)
                .targetId(targetId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationPort.saveAllNotifications(List.of(notification));

        // 3. FCM 발송
        List<FcmToken> tokens = notificationPort.findTokensByUserId(targetUserId);

        for (FcmToken tokenInfo : tokens) {
            try {
                fcmPort.sendPush(tokenInfo.getToken(), title, message);
            } catch (Exception e) {
                log.warn("사용자 {} 에게 FCM 발송 실패 (token={}): {}", targetUserId, tokenInfo.getToken(), e.getMessage());
            }
        }
    }
}
