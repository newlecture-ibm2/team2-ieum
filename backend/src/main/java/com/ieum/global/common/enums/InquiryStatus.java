package com.ieum.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 문의 처리 상태
 * - PENDING: 접수 후 관리자 답변 대기
 * - ANSWERED: 관리자 답변 완료
 */
@Getter
@RequiredArgsConstructor
public enum InquiryStatus {

    PENDING("대기 중"),
    ANSWERED("답변 완료");

    private final String description;
}
