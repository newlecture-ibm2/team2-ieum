package com.ieum.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 신고 처리 상태
 * - PENDING: 접수 후 관리자 처리 대기
 * - RESOLVED: 관리자가 조치 완료
 * - REJECTED: 관리자가 반려(미조치)
 */
@Getter
@RequiredArgsConstructor
public enum ReportStatus {

    PENDING("대기 중"),
    RESOLVED("처리 완료"),
    REJECTED("반려");

    private final String description;
}
