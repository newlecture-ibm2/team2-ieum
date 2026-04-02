package com.ieum.user.notification.application.port.in;

import com.ieum.user.notification.domain.model.NotificationSetting;

/**
 * 알림 수신 여부 설정 변경 유스케이스 (API_USR_0060)
 */
public interface UpdateNotificationSettingUseCase {

    /**
     * 알림 설정 변경 (pushEnabled, festivalStart, festivalEnd, notice, comment)
     */
    NotificationSetting updateSettings(Long userId, Boolean pushEnabled,
                                        Boolean festivalStart, Boolean festivalEnd,
                                        Boolean notice, Boolean comment);
}
