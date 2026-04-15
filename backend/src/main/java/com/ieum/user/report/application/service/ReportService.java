package com.ieum.user.report.application.service;

import com.ieum.user.report.application.port.in.CreateReportUseCase;
import com.ieum.user.report.application.port.in.LoadReportUseCase;
import com.ieum.user.report.application.port.out.ReportPort;
import com.ieum.user.report.domain.model.Report;
import com.ieum.user.report.adapter.in.web.dto.ReportResponse;
import com.ieum.global.common.enums.ReportReason;
import com.ieum.global.common.enums.ReportStatus;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReportService implements CreateReportUseCase, LoadReportUseCase {

    private final ReportPort reportPort;
    private final com.ieum.community.application.port.out.CommentPort commentPort;
    private final com.ieum.user.review.application.port.out.ReviewPersistencePort reviewPersistencePort;

    private static final Set<String> VALID_TARGET_TYPES = Set.of(Report.TARGET_POST, Report.TARGET_COMMENT, Report.TARGET_REVIEW);
    private static final Set<String> VALID_REASONS = Set.of(
            ReportReason.SPAM.name(), ReportReason.ABUSE.name(),
            ReportReason.INAPPROPRIATE.name(), ReportReason.FALSE_INFO.name(),
            ReportReason.OTHER.name()
    );

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
            if (ReportStatus.PENDING.name().equals(existing.getStatus()) || ReportStatus.RESOLVED.name().equals(existing.getStatus())) {
                throw new BusinessException(ErrorCode.REPORT_001, "이미 신고한 대상입니다.");
            } else if (ReportStatus.REJECTED.name().equals(existing.getStatus())) {
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
                .status(ReportStatus.PENDING.name())
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
        return ReportStatus.PENDING.name().equals(status) || ReportStatus.RESOLVED.name().equals(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getMyReportedTargetIds(Long reporterId, String targetType) {
        if (reporterId == null) return Collections.emptyList();
        return reportPort.findTargetIdsByReporterIdAndTargetTypeAndStatusIn(
            reporterId, targetType, List.of(ReportStatus.PENDING.name(), ReportStatus.RESOLVED.name())
        );
    }

    /**
     * 설계서 API_USR_0080: 내 신고 내역 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Report> getMyReports(Long reporterId) {
        if (reporterId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "조회하려면 로그인이 필요합니다.");
        }
        List<Report> reports = reportPort.findAllByReporterId(reporterId);
        reports.forEach(this::populateParentInfo);
        return reports;
    }

    /**
     * 설계서 API_USR_0081: 신고 상세 및 답변 조회
     */
    @Transactional(readOnly = true)
    public Report getReportDetail(Long reportId, Long reporterId) {
        if (reporterId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "조회하려면 로그인이 필요합니다.");
        }
        Report report = reportPort.findByIdAndReporterId(reportId, reporterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_001, "해당 신고 내역을 찾을 수 없거나 권한이 없습니다."));
        
        populateParentInfo(report);
        return report;
    }

    private void populateParentInfo(Report report) {
        // COMMENT인 경우 PostId(상위 ID)를 찾아서 채워줌 (대소문자 무시)
        if (Report.TARGET_COMMENT.equalsIgnoreCase(report.getTargetType())) {
            commentPort.findById(report.getTargetId()).ifPresentOrElse(comment -> {
                report.setTargetParentId(comment.getPostId());
            }, () -> {
                log.warn("신고 상위 ID 보강 실패: Comment를 찾을 수 없음 (reportId={}, targetId={})", report.getId(), report.getTargetId());
            });
        } 
        
        // REVIEW인 경우 FestivalId(상위 ID)를 찾아서 채워줌 (대소문자 무시)
        if (Report.TARGET_REVIEW.equalsIgnoreCase(report.getTargetType())) {
            reviewPersistencePort.findById(report.getTargetId()).ifPresentOrElse(review -> {
                report.setTargetParentId(review.getFestivalId());
            }, () -> {
                log.warn("신고 상위 ID 보강 실패: Review를 찾을 수 없음 (reportId={}, targetId={})", report.getId(), report.getTargetId());
            });
        }
    }
}
