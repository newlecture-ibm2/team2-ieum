package com.ieum.user.notification.application.port.in;

import com.ieum.user.notification.domain.model.NotificationSetting;

/**
 * 알림 설정 조회 유스케이스
 */
public interface GetNotificationSettingsUseCase {
    NotificationSetting getSettings(Long userId);
}
