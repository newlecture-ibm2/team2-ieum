package com.ieum.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 콘텐츠(게시글/댓글/리뷰) 공통 상태
 * - ACTIVE: 정상 노출 상태
 * - REMOVED: 삭제(숨김) 처리됨
 */
@Getter
@RequiredArgsConstructor
public enum ContentStatus {

    ACTIVE("활성"),
    REMOVED("삭제됨");

    private final String description;
}
