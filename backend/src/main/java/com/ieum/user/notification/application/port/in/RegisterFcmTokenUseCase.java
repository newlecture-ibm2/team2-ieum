package com.ieum.user.notification.application.port.in;

/**
 * FCM 푸시 토큰 등록 유스케이스 (API_USR_0050)
 */
public interface RegisterFcmTokenUseCase {

    /**
     * FCM 디바이스 토큰 등록 (동일 토큰 존재 시 갱신)
     */
    void register(Long userId, String token);
}
