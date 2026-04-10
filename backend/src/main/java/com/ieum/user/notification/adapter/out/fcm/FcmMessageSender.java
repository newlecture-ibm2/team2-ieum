package com.ieum.user.notification.adapter.out.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.ieum.user.notification.application.port.out.FcmPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * FCM 푸시 발송 어댑터 (Out Adapter)
 * - Firebase Cloud Messaging API를 호출하는 구현체
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FcmMessageSender implements FcmPort {

    /**
     * 특정 토큰(디바이스)으로 FCM 푸시 발송
     */
    @Override
    public void sendPush(String targetToken, String title, String body) {
        if (targetToken == null || targetToken.trim().isEmpty()) {
            return; // 토큰 없으면 스킵
        }

        try {
            Message message = Message.builder()
                    .setToken(targetToken)
                    .putData("title", title)
                    .putData("body", body)
                    .putData("icon", "/favicon/favicon-ieum-transparent.png")
                    .build();

            // FirebaseMessaging을 통해 발송
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("FCM 푸시 전송 성공: {}", response);

        } catch (Exception e) {
            log.error("FCM 푸시 전송 실패 (토큰={}): {}", targetToken, e.getMessage());
        }
    }
}
