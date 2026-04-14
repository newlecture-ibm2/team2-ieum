package com.ieum.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 알림 유형
 * - 사용자에게 전송되는 알림의 분류
 */
@Getter
@RequiredArgsConstructor
public enum NotificationType {

    COMMENT("댓글 알림"),
    NOTICE("공지사항 알림"),
    REPORT("신고 결과 알림");

    private final String displayName;
}
