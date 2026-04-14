package com.ieum.admin.statistics.adapter.out.persistence;

import com.ieum.admin.statistics.application.port.out.DashboardQueryPort;
import com.ieum.admin.statistics.application.result.DashboardRecentItem;
import com.ieum.admin.statistics.application.result.DashboardTrendItem;
import com.ieum.global.common.enums.ReportReason;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DashboardPersistenceAdapter implements DashboardQueryPort {

    @PersistenceContext
    private final EntityManager em;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd");

    /* ═══ KPI (Action) ═══ */

    @Override
    public long countOngoingPublicFestivals() {
        return (long) em.createQuery(
                "SELECT COUNT(f) FROM FestivalEntity f WHERE f.status = 'ONGOING' AND f.isCustom = false")
                .getSingleResult();
    }

    @Override
    public long countOngoingCustomFestivals() {
        return (long) em.createQuery(
                "SELECT COUNT(f) FROM FestivalEntity f WHERE f.status = 'ONGOING' AND f.isCustom = true")
                .getSingleResult();
    }

    @Override
    public long countReportsByStatus(String status) {
        return (long) em.createQuery("SELECT COUNT(r) FROM ReportEntity r WHERE r.status = :status")
                .setParameter("status", status).getSingleResult();
    }

    @Override
    public long countInquiriesByStatus(String status) {
        return (long) em.createQuery("SELECT COUNT(i) FROM InquiryEntity i WHERE i.status = :status")
                .setParameter("status", status).getSingleResult();
    }

    /* ═══ Operation (Result) ═══ */

    @Override
    public long countFestivalsByStatus(String status) {
        return (long) em.createQuery("SELECT COUNT(f) FROM FestivalEntity f WHERE f.status = :status")
                .setParameter("status", status).getSingleResult();
    }

    @Override
    public long countHiddenFestivals() {
        return (long) em.createQuery(
                "SELECT COUNT(f) FROM FestivalEntity f WHERE f.isVisible = false")
                .getSingleResult();
    }

    @Override
    public long countAnsweredInquiries() {
        return (long) em.createQuery("SELECT COUNT(i) FROM InquiryEntity i WHERE i.status = 'ANSWERED'")
                .getSingleResult();
    }

    /* ═══ 추이 ═══ */

    @Override
    public List<DashboardTrendItem> findReportTrendLast7Days() {
        LocalDate startDate = LocalDate.now().minusDays(6);
        LocalDate endDate = LocalDate.now();
        return findReportTrend(startDate, endDate);
    }

    @Override
    public List<DashboardTrendItem> findInquiryTrendLast7Days() {
        LocalDate startDate = LocalDate.now().minusDays(6);
        LocalDate endDate = LocalDate.now();
        return findInquiryTrend(startDate, endDate);
    }

    private List<DashboardTrendItem> buildDynamicDays(Map<String, Long> data, LocalDate startDate, LocalDate endDate, boolean isReport) {
        List<DashboardTrendItem> result = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            long c = data.getOrDefault(current.toString(), 0L);
            result.add(new DashboardTrendItem(current.format(DATE_FMT), isReport ? c : 0, isReport ? 0 : c));
            current = current.plusDays(1);
        }
        return result;
    }

    @Override
    public List<DashboardTrendItem> findReportTrend(LocalDate startDate, LocalDate endDate) {
        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to = endDate.atTime(23, 59, 59);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT FUNCTION('DATE', r.createdAt), COUNT(r) FROM ReportEntity r " +
                "WHERE r.createdAt >= :from AND r.createdAt <= :to GROUP BY FUNCTION('DATE', r.createdAt) ORDER BY FUNCTION('DATE', r.createdAt)")
                .setParameter("from", from).setParameter("to", to).getResultList();
        Map<String, Long> m = rows.stream().collect(Collectors.toMap(
                r -> r[0].toString(), 
                r -> (long) r[1], 
                (a, b) -> a + b
        ));
        return buildDynamicDays(m, startDate, endDate, true);
    }

    @Override
    public List<DashboardTrendItem> findInquiryTrend(LocalDate startDate, LocalDate endDate) {
        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to = endDate.atTime(23, 59, 59);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT FUNCTION('DATE', i.createdAt), COUNT(i) FROM InquiryEntity i " +
                "WHERE i.createdAt >= :from AND i.createdAt <= :to GROUP BY FUNCTION('DATE', i.createdAt) ORDER BY FUNCTION('DATE', i.createdAt)")
                .setParameter("from", from).setParameter("to", to).getResultList();
        Map<String, Long> m = rows.stream().collect(Collectors.toMap(
                r -> r[0].toString(), 
                r -> (long) r[1], 
                (a, b) -> a + b
        ));
        return buildDynamicDays(m, startDate, endDate, false);
    }

    /* ═══ 최근 내역 ═══ */

    @Override
    public List<DashboardRecentItem> findRecentReports(int limit) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT r.id, r.reason, r.status, r.createdAt FROM ReportEntity r ORDER BY r.createdAt DESC")
                .setMaxResults(limit).getResultList();
        return rows.stream().map(r -> DashboardRecentItem.builder()
                .id((long) r[0]).type("REPORT").title(reasonLabel((String) r[1]))
                .status((String) r[2]).createdAt(r[3].toString().substring(0, 10)).build()
        ).collect(Collectors.toList());
    }

    @Override
    public List<DashboardRecentItem> findRecentInquiries(int limit) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT i.id, i.title, i.status, i.createdAt FROM InquiryEntity i ORDER BY i.createdAt DESC")
                .setMaxResults(limit).getResultList();
        return rows.stream().map(r -> DashboardRecentItem.builder()
                .id((long) r[0]).type("INQUIRY").title((String) r[1])
                .status((String) r[2]).createdAt(r[3].toString().substring(0, 10)).build()
        ).collect(Collectors.toList());
    }

    private String reasonLabel(String reason) {
        if (reason == null) return "신고";
        try {
            return ReportReason.valueOf(reason).getDisplayName();
        } catch (IllegalArgumentException e) {
            return "기타 신고";
        }
    }
}
