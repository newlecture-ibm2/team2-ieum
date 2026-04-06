package com.ieum.admin.inquiry.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 문의 도메인 모델
 */
@Getter
@Builder
@AllArgsConstructor
public class Inquiry {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String status;      // PENDING | ANSWERED
    private String answer;
    private String answeredAt;
    private String createdAt;
    private String authorNickname;
}
