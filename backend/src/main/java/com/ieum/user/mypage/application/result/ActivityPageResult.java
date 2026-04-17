package com.ieum.user.mypage.application.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * [v18-0] 마이페이지 활동 목록 페이징 결과 (Application Result)
 * - Festival 도메인의 PageResult 패턴 준수
 */
@Getter
@AllArgsConstructor
public class ActivityPageResult {
    private final List<ActivityItemResult> activities;
    private final long totalElements;
    private final int totalPages;
    private final int currentPage;
}
