package com.ieum.user.notification.application.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmMessageSender {

    /**
     * 특정 토큰(디바이스)으로 FCM 푸시 발송
     */
    public void sendPush(String targetToken, String title, String body) {
        if (targetToken == null || targetToken.trim().isEmpty()) {
            return; // 토큰 없으면 스킵
        }

        try {
            Message message = Message.builder()
                    .setToken(targetToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            // FirebaseMessaging을 통해 발송
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("FCM 푸시 전송 성공: {}", response);

        } catch (Exception e) {
            log.error("FCM 푸시 전송 실패 (토큰={}): {}", targetToken, e.getMessage());
        }
    }
}
