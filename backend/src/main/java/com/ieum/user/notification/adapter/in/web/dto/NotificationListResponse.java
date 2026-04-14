package com.ieum.user.notification.adapter.in.web.dto;

import com.ieum.user.notification.domain.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 내 알림 목록 조회 응답 DTO (API_USR_0040)
 */
@Getter
@AllArgsConstructor
public class NotificationListResponse {

    /** 읽지 않은 알림 수 */
    private long unreadCount;

    /** 알림 목록 */
    private List<Notification> notifications;
}
