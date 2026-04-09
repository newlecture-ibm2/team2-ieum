package com.ieum.user.notification.application.port.in;

import com.ieum.user.notification.adapter.in.web.dto.NotificationListResponse;

/**
 * 내 알림 목록 조회 유스케이스 (API_USR_0040)
 */
public interface GetMyNotificationsUseCase {

    /**
     * @return 읽지 않은 알림 수 + 알림 목록
     */
    NotificationListResponse getMyNotifications(Long userId);
}
