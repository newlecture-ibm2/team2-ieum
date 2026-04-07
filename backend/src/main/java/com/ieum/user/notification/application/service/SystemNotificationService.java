package com.ieum.user.notification.application.service;

import com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity;
import com.ieum.user.auth.adapter.out.persistence.repository.UserJpaRepository;
import com.ieum.user.notification.application.port.in.SystemNotificationUseCase;
import com.ieum.user.notification.application.port.out.NotificationPort;
import com.ieum.user.notification.domain.model.FcmToken;
import com.ieum.user.notification.domain.model.Notification;
import com.ieum.user.notification.domain.model.NotificationSetting;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 시스템 통합 알림 서비스
 * 공지사항 생성 등 시스템 전체 사용자 대상 알림 발송 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SystemNotificationService implements SystemNotificationUseCase {

    private final FcmMessageSender fcmMessageSender;
    private final NotificationPort notificationPort;
    private final UserJpaRepository userJpaRepository;

    @Override
    public void sendNoticeNotification(Long noticeId, String title, String summary) {
        log.info("전체 사용자 대상 공지사항 푸시 알림 발송 시작: noticeId={}", noticeId);
        
        List<UserJpaEntity> allUsers = userJpaRepository.findAll();
        List<FcmToken> allTokens = notificationPort.findAllTokens();

        // userId 단위로 토큰 매핑
        Map<Long, List<FcmToken>> tokensByUser = allTokens.stream()
                .collect(Collectors.groupingBy(FcmToken::getUserId));

        List<Notification> bulkNotifications = new ArrayList<>();

        for (UserJpaEntity user : allUsers) {
            Long userId = user.getId();
            
            // 알림 설정 확인 (설정이 없으면 기본적으로 받는다고 가정)
            NotificationSetting setting = notificationPort.findSettingByUserId(userId).orElse(null);
            boolean isNoticePushEnabled = true;
            if (setting != null) {
                // 앱 전체 알림이 꺼져있거나, 공지사항 알림이 꺼져있으면 발송 제외
                if (Boolean.FALSE.equals(setting.getPushEnabled()) || Boolean.FALSE.equals(setting.getNotice())) {
                    isNoticePushEnabled = false;
                }
            }

            if (!isNoticePushEnabled) {
                continue;
            }

            // 1. DB 알림 생성
            String notificationMessage = summary == null || summary.isEmpty() 
                    ? title 
                    : title + " - " + summary;
                    
            Notification notification = Notification.builder()
                    .userId(userId)
                    .type("NOTICE")
                    .message(notificationMessage)
                    .targetType("NOTICE")
                    .targetId(noticeId)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            bulkNotifications.add(notification);

            // 2. FCM 발송
            List<FcmToken> userTokens = tokensByUser.get(userId);
            if (userTokens != null) {
                for (FcmToken tokenInfo : userTokens) {
                    fcmMessageSender.sendPush(tokenInfo.getToken(), "이음 - 새 공지사항", notificationMessage);
                }
            }
        }

        // DB 알림 일괄 저장
        if (!bulkNotifications.isEmpty()) {
            notificationPort.saveAllNotifications(bulkNotifications);
            log.info("{} 명의 사용자에게 공지사항 알림 저장 완료", bulkNotifications.size());
        }
    }
}
