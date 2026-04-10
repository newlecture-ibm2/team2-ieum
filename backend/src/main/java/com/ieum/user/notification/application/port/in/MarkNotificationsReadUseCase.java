package com.ieum.user.notification.application.port.in;

import java.util.List;

/**
 * 알림 읽음 처리 유스케이스 (API_USR_0070)
 */
public interface MarkNotificationsReadUseCase {

    /**
     * 읽음 처리
     * @param notificationIds 빈 리스트면 전체 읽음, 값 있으면 해당 알림만
     * @return 읽음 처리된 건수
     */
    int markAsRead(Long userId, List<Long> notificationIds);
}
