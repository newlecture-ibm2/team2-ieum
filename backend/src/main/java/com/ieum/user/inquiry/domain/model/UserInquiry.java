package com.ieum.user.inquiry.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * [Domain] 사용자 문의 도메인 객체 (순수 객체, 인프라스트럭처 종속 없음)
 */
@Getter
@Builder
@AllArgsConstructor
public class UserInquiry {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String status;      // PENDING | ANSWERED
    private String answer;
    private LocalDateTime answeredAt;
    private LocalDateTime createdAt;
}
