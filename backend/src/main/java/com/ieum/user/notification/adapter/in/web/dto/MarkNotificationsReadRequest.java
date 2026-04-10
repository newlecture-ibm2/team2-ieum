package com.ieum.user.notification.adapter.in.web.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 알림 읽음 처리 요청 DTO (API_USR_0070)
 * - notificationIds가 null 또는 빈 리스트면 전체 읽음 처리
 */
@Getter
@NoArgsConstructor
public class MarkNotificationsReadRequest {

    /** 읽음 처리할 알림 ID 목록 (빈 리스트/null → 전체 읽음) */
    private List<Long> notificationIds;
}
