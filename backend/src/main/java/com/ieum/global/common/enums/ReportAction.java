package com.ieum.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 관리자 신고 처리 액션
 * - 관리자가 신고를 처리할 때 선택하는 조치 유형
 */
@Getter
@RequiredArgsConstructor
public enum ReportAction {

    DISMISS("반려"),
    DELETE("콘텐츠 삭제"),
    SUSPEND("회원 정지"),
    WARNING("경고");

    private final String displayName;
}
