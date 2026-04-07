package com.ieum.admin.statistics.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 최근 처리 내역 아이템
 */
@Getter
@Builder
@AllArgsConstructor
public class DashboardRecentItem {
    private final long id;
    private final String type;       // "REPORT" | "INQUIRY"
    private final String title;
    private final String status;
    private final String createdAt;
}
