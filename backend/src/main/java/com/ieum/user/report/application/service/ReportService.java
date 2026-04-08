package com.ieum.user.report.application.service;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportEntity;
import com.ieum.user.report.adapter.in.web.dto.ReportRequest;
import com.ieum.user.report.adapter.in.web.dto.ReportResponse;
import com.ieum.user.report.adapter.out.persistence.repository.ReportRepository;
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
 * 통합 사용자 신고 Service (POST, COMMENT, REVIEW 공통)
 * - 신고 접수 (중복 방지 + 반려 시 재신고 지원)
 * - targetType / reason 유효성 검증
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    /** 허용되는 targetType 값 */
    private static final Set<String> VALID_TARGET_TYPES = Set.of("POST", "COMMENT", "REVIEW");

    /** 허용되는 reason 값 */
    private static final Set<String> VALID_REASONS = Set.of("SPAM", "ABUSE", "INAPPROPRIATE", "FALSE_INFO", "OTHER");

    @Transactional
    public ReportResponse createReport(ReportRequest request, Long reporterId) {
        // 1. 로그인 확인
        if (reporterId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "신고하려면 로그인이 필요합니다.");
        }

        // 2. targetType 유효성 검증
        if (request.getTargetType() == null || !VALID_TARGET_TYPES.contains(request.getTargetType())) {
            throw new BusinessException(ErrorCode.COMMON_001,
                    "유효하지 않은 신고 대상 유형입니다. (허용: POST, COMMENT, REVIEW)");
        }

        // 3. reason 유효성 검증
        if (request.getReason() == null || !VALID_REASONS.contains(request.getReason())) {
            throw new BusinessException(ErrorCode.COMMON_001,
                    "유효하지 않은 신고 사유입니다. (허용: SPAM, ABUSE, INAPPROPRIATE, FALSE_INFO, OTHER)");
        }

        // 4. targetId 유효성 검증
        if (request.getTargetId() == null) {
            throw new BusinessException(ErrorCode.COMMON_001, "신고 대상 ID가 누락되었습니다.");
        }

        // 5. 중복 신고 방지 (UK: reporter_id + target_type + target_id)
        Optional<ReportEntity> existingOpt = reportRepository.findByReporterIdAndTargetTypeAndTargetId(
                reporterId, request.getTargetType(), request.getTargetId());

        if (existingOpt.isPresent()) {
            ReportEntity existing = existingOpt.get();
            if ("PENDING".equals(existing.getStatus()) || "RESOLVED".equals(existing.getStatus())) {
                throw new BusinessException(ErrorCode.REPORT_001, "이미 신고한 대상입니다.");
            } else if ("REJECTED".equals(existing.getStatus())) {
                // 반려된 상태면 다시 PENDING으로 업데이트하며 사유 갱신
                existing.setStatus("PENDING");
                existing.setReason(request.getReason());
                existing.setDescription(request.getDescription());
                existing.setCreatedAt(LocalDateTime.now());
                existing.setAction(null);
                existing.setAdminNote(null);
                existing.setProcessedAt(null);

                ReportEntity saved = reportRepository.save(existing);
                return ReportResponse.fromEntity(saved);
            }
        }

        // 6. 엔티티 생성 및 저장 (기존 내역이 전혀 없는 경우)
        ReportEntity entity = ReportEntity.builder()
                .reporterId(reporterId)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .description(request.getDescription())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        ReportEntity saved = reportRepository.save(entity);
        return ReportResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public boolean isAlreadyReported(Long reporterId, String targetType, Long targetId) {
        Optional<ReportEntity> existingOpt = reportRepository.findByReporterIdAndTargetTypeAndTargetId(
                reporterId, targetType, targetId);
        if (existingOpt.isEmpty()) {
            return false;
        }
        String status = existingOpt.get().getStatus();
        // PENDING 또는 RESOLVED 상태인 경우에만 중복 신고로 간주
        return "PENDING".equals(status) || "RESOLVED".equals(status);
    }

    /**
     * 내가 신고한 특정 유형의 대상 ID 목록 조회 (PENDING, RESOLVED 상태 한정)
     */
    @Transactional(readOnly = true)
    public List<Long> getMyReportedTargetIds(Long reporterId, String targetType) {
        if (reporterId == null) return Collections.emptyList();
        return reportRepository.findTargetIdsByReporterIdAndTargetTypeAndStatusIn(
                reporterId, targetType, List.of("PENDING", "RESOLVED")
        );
    }

    /**
     * 설계서 API_USR_0080: 내 신고 내역 목록 조회
     */
    @Transactional(readOnly = true)
    public java.util.List<ReportResponse> getMyReports(Long reporterId) {
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(reporterId).stream()
                .map(ReportResponse::fromEntity)
                .toList();
    }

    /**
     * 설계서 API_USR_0081: 신고 상세 및 답변 조회
     */
    @Transactional(readOnly = true)
    public ReportResponse getReportDetail(Long reportId, Long reporterId) {
        ReportEntity entity = reportRepository.findByIdAndReporterId(reportId, reporterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_001, "본인의 신고 내역만 조회할 수 있습니다."));
        return ReportResponse.fromEntity(entity);
    }
}
