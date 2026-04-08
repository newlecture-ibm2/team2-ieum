package com.ieum.user.report.application.service;

import com.ieum.user.report.application.port.in.CreateReportUseCase;
import com.ieum.user.report.application.port.in.LoadReportUseCase;
import com.ieum.user.report.application.port.out.ReportPort;
import com.ieum.user.report.domain.model.Report;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * 사용자 신고 Service (UseCase 구현체)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ReportService implements CreateReportUseCase, LoadReportUseCase {

    private final ReportPort reportPort;

    private static final Set<String> VALID_TARGET_TYPES = Set.of("POST", "COMMENT", "REVIEW");
    private static final Set<String> VALID_REASONS = Set.of("SPAM", "ABUSE", "INAPPROPRIATE", "FALSE_INFO", "OTHER");

    @Override
    public Report createReport(String targetType, Long targetId, String reason, String description, Long reporterId) {
        if (reporterId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "신고하려면 로그인이 필요합니다.");
        }
        if (targetType == null || !VALID_TARGET_TYPES.contains(targetType)) {
            throw new BusinessException(ErrorCode.COMMON_001, "유효하지 않은 신고 대상 유형입니다.");
        }
        if (reason == null || !VALID_REASONS.contains(reason)) {
            throw new BusinessException(ErrorCode.COMMON_001, "유효하지 않은 신고 사유입니다.");
        }
        if (targetId == null) {
            throw new BusinessException(ErrorCode.COMMON_001, "신고 대상 ID가 누락되었습니다.");
        }

        Optional<Report> existingOpt = reportPort.findByReporterIdAndTargetTypeAndTargetId(reporterId, targetType, targetId);

        if (existingOpt.isPresent()) {
            Report existing = existingOpt.get();
            if ("PENDING".equals(existing.getStatus()) || "RESOLVED".equals(existing.getStatus())) {
                throw new BusinessException(ErrorCode.REPORT_001, "이미 신고한 대상입니다.");
            } else if ("REJECTED".equals(existing.getStatus())) {
                existing.updateForRejection(reason, description);
                return reportPort.save(existing);
            }
        }

        Report report = Report.builder()
                .reporterId(reporterId)
                .targetType(targetType)
                .targetId(targetId)
                .reason(reason)
                .description(description)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return reportPort.save(report);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isAlreadyReported(Long reporterId, String targetType, Long targetId) {
        Optional<Report> existingOpt = reportPort.findByReporterIdAndTargetTypeAndTargetId(reporterId, targetType, targetId);
        if (existingOpt.isEmpty()) {
            return false;
        }
        String status = existingOpt.get().getStatus();
        return "PENDING".equals(status) || "RESOLVED".equals(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getMyReportedTargetIds(Long reporterId, String targetType) {
        if (reporterId == null) return Collections.emptyList();
        return reportPort.findTargetIdsByReporterIdAndTargetTypeAndStatusIn(
            reporterId, targetType, List.of("PENDING", "RESOLVED")
        );
    }
}
