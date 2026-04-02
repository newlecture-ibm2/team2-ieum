package com.ieum.user.notification.application.port.in;

import java.util.Map;

/**
 * 내 알림 목록 조회 유스케이스 (API_USR_0040)
 */
public interface GetMyNotificationsUseCase {

    /**
     * @return unread 카운트 + 알림 목록
     */
    Map<String, Object> getMyNotifications(Long userId);
}
