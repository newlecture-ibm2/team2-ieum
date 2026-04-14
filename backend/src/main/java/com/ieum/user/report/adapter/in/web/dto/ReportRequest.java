package com.ieum.user.report.adapter.in.web.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 신고 요청 DTO (통합 — POST, COMMENT, REVIEW 공통)
 *
 * targetType: REVIEW / POST / COMMENT
 * reason: SPAM / ABUSE / INAPPROPRIATE / FALSE_INFO / OTHER
 */
@Getter
@NoArgsConstructor
public class ReportRequest {

    /** 신고 대상 유형 (POST, COMMENT, REVIEW) */
    private String targetType;

    /** 신고 대상 ID */
    private Long targetId;

    /** 신고 사유 (SPAM / ABUSE / INAPPROPRIATE / FALSE_INFO / OTHER) */
    private String reason;

    /** 상세 설명 (사용자 입력, 최대 500자) */
    private String description;
}
