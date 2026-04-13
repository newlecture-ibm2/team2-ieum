package com.ieum.admin.statistics.application.service;

import com.ieum.admin.statistics.application.port.in.GetDashboardUseCase;
import com.ieum.admin.statistics.application.port.out.DashboardQueryPort;
import com.ieum.admin.statistics.application.result.DashboardRecentItem;
import com.ieum.admin.statistics.application.result.DashboardResult;
import com.ieum.admin.statistics.application.result.DashboardTrendItem;
import com.ieum.admin.festival.domain.model.FestivalStatus;
import com.ieum.global.common.enums.ReportStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService implements GetDashboardUseCase {

    private final DashboardQueryPort port;
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Override
    public DashboardResult getDashboard() {
        // 1. KPI — "지금 처리해야 할 것"
        DashboardResult.KpiData kpi = DashboardResult.KpiData.builder()
                .ongoingPublicFestivals(port.countOngoingPublicFestivals())
                .ongoingCustomFestivals(port.countOngoingCustomFestivals())
                .pendingReports(port.countReportsByStatus(ReportStatus.PENDING.name()))
                .pendingInquiries(port.countInquiriesByStatus(ReportStatus.PENDING.name()))
                .build();

        // 2. 추이
        List<DashboardTrendItem> merged = mergeTrend(
                port.findReportTrendLast7Days(),
                port.findInquiryTrendLast7Days());

        // 3. 최근 내역 (각각 최대 5건)
        List<DashboardRecentItem> recentReports = port.findRecentReports(5);
        List<DashboardRecentItem> recentInquiries = port.findRecentInquiries(5);

        // 4. 운영 요약 — "처리 결과"
        DashboardResult.OperationSummary operation = DashboardResult.OperationSummary.builder()
                .resolvedReports(port.countReportsByStatus(ReportStatus.RESOLVED.name()))
                .answeredInquiries(port.countAnsweredInquiries())
                .endedFestivals(port.countFestivalsByStatus(FestivalStatus.ENDED.name()))
                .hiddenFestivals(port.countHiddenFestivals())
                .lastUpdated(LocalDateTime.now().format(DT_FMT))
                .build();

        return DashboardResult.builder()
                .kpi(kpi).trend(merged)
                .recentReports(recentReports)
                .recentInquiries(recentInquiries)
                .operation(operation)
                .build();
    }

    @Override
    public List<DashboardTrendItem> getDashboardTrend(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        List<DashboardTrendItem> reports = port.findReportTrend(startDate, endDate);
        List<DashboardTrendItem> inquiries = port.findInquiryTrend(startDate, endDate);
        return mergeTrend(reports, inquiries);
    }

    private List<DashboardTrendItem> mergeTrend(List<DashboardTrendItem> r, List<DashboardTrendItem> i) {
        Map<String, Long> iMap = i.stream()
                .collect(Collectors.toMap(DashboardTrendItem::getDate, DashboardTrendItem::getInquiries));
        return r.stream()
                .map(x -> new DashboardTrendItem(x.getDate(), x.getReports(), iMap.getOrDefault(x.getDate(), 0L)))
                .collect(Collectors.toList());
    }
}
