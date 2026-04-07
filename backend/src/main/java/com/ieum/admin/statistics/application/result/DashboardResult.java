package com.ieum.admin.statistics.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardResult {

    /** KPI = "지금 처리해야 할 것" (Action) */
    private final KpiData kpi;

    /** 최근 7일 추이 */
    private final List<DashboardTrendItem> trend;

    /** 최근 신고 현황 (최대 5건) */
    private final List<DashboardRecentItem> recentReports;

    /** 최근 문의 현황 (최대 5건) */
    private final List<DashboardRecentItem> recentInquiries;

    /** 운영 상태 요약 = "처리 결과" (Result) */
    private final OperationSummary operation;

    @Getter
    @Builder
    public static class KpiData {
        private final long ongoingPublicFestivals;
        private final long ongoingCustomFestivals;
        private final long pendingReports;
        private final long pendingInquiries;
    }

    @Getter
    @Builder
    public static class OperationSummary {
        private final long resolvedReports;
        private final long answeredInquiries;
        private final long endedFestivals;
        private final long hiddenFestivals;
        private final String lastUpdated;
    }
}
