package com.ieum.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 신고 사유
 * - 프론트엔드 선택지와 1:1 매핑
 * - displayName을 통해 한글 라벨 내장 (대시보드 통계 표시용)
 */
@Getter
@RequiredArgsConstructor
public enum ReportReason {

    SPAM("스팸 신고"),
    ABUSE("욕설/비방 신고"),
    INAPPROPRIATE("부적절한 콘텐츠 신고"),
    FALSE_INFO("허위 정보 신고"),
    OTHER("기타");

    private final String displayName;
}
