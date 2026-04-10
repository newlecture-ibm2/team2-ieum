package com.ieum.user.deletion.application.port.out;

public interface DeleteUserNotificationPort {
    void deleteSettingsAndNotifications(Long userId);
}
