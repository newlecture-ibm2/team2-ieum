package com.ieum.admin.statistics.application.port.out;

import com.ieum.admin.statistics.application.result.DashboardRecentItem;
import com.ieum.admin.statistics.application.result.DashboardTrendItem;

import java.util.List;

public interface DashboardQueryPort {

    /* ── KPI (Action) ── */
    long countOngoingPublicFestivals();
    long countOngoingCustomFestivals();
    long countReportsByStatus(String status);
    long countInquiriesByStatus(String status);

    /* ── Operation (Result) ── */
    long countFestivalsByStatus(String status);
    long countHiddenFestivals();
    long countAnsweredInquiries();

    /* ── 추이 ── */
    List<DashboardTrendItem> findReportTrendLast7Days();
    List<DashboardTrendItem> findInquiryTrendLast7Days();
    
    // 동적 기간 조회
    List<DashboardTrendItem> findReportTrend(java.time.LocalDate startDate, java.time.LocalDate endDate);
    List<DashboardTrendItem> findInquiryTrend(java.time.LocalDate startDate, java.time.LocalDate endDate);

    /* ── 최근 내역 ── */
    List<DashboardRecentItem> findRecentReports(int limit);
    List<DashboardRecentItem> findRecentInquiries(int limit);
}
