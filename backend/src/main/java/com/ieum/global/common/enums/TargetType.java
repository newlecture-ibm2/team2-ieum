package com.ieum.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 신고/첨부파일 대상 유형
 * - 신고(Report)와 첨부파일(Attachment)에서 공통으로 사용
 */
@Getter
@RequiredArgsConstructor
public enum TargetType {

    POST("게시글"),
    COMMENT("댓글"),
    REVIEW("리뷰"),
    NOTICE("공지사항"),
    FESTIVAL("축제"),
    COMMUNITY("커뮤니티"),
    PROFILE("프로필");

    private final String displayName;
}
