package com.ieum.user.notification.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 알림 설정 도메인 모델 (순수 자바 객체)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSetting {

    private Long id;
    private Long userId;

    @Builder.Default
    private Boolean pushEnabled = true;

    @Builder.Default
    private Boolean festivalStart = true;

    @Builder.Default
    private Boolean festivalEnd = true;

    @Builder.Default
    private Boolean notice = true;

    @Builder.Default
    private Boolean comment = true;

    private LocalDateTime updatedAt;
}
