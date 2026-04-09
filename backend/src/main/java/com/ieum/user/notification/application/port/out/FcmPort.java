package com.ieum.user.notification.application.port.out;

/**
 * FCM 푸시 발송 포트 (Port OUT)
 * - 외부 시스템(Firebase) 호출을 추상화
 */
public interface FcmPort {

    /**
     * 특정 토큰(디바이스)으로 FCM 푸시 발송
     *
     * @param targetToken FCM 디바이스 토큰
     * @param title       알림 제목
     * @param body        알림 내용
     */
    void sendPush(String targetToken, String title, String body);
}
