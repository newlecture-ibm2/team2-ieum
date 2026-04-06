package com.ieum.admin.report.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 신고 목록 응답 Result DTO
 */
@Getter
@Builder
public class ReportListResult {
    private List<ReportItem> content;
    private int totalPages;
    private long totalElements;
    private long pendingCount;
    private long resolvedCount;
    private long rejectedCount;
}
