package com.ieum.user.notification.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * FCM 디바이스 토큰 도메인 모델 (순수 자바 객체)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FcmToken {

    private Long id;
    private Long userId;
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
