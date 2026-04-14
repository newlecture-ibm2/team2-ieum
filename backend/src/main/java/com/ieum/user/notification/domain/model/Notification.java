package com.ieum.user.notification.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 알림 도메인 모델 (순수 자바 객체)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    private Long id;
    private Long userId;
    private String type;
    private String message;

    @Builder.Default
    private Boolean isRead = false;

    private String targetType;
    private Long targetId;
    private LocalDateTime createdAt;
}
