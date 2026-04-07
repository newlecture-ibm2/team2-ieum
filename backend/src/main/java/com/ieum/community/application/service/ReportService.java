package com.ieum.community.application.service;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportEntity;
import com.ieum.community.adapter.in.web.dto.ReportRequest;
import com.ieum.community.adapter.in.web.dto.ReportResponse;
import com.ieum.community.adapter.out.persistence.repository.ReportRepository;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * 사용자 신고 Service
 * - 신고 접수 (중복 방지)
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
        boolean alreadyReported = reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporterId, request.getTargetType(), request.getTargetId());
        if (alreadyReported) {
            throw new BusinessException(ErrorCode.REPORT_001, "이미 신고한 대상입니다.");
        }

        // 6. 엔티티 생성 및 저장
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

    /**
     * 이미 신고했는지 확인
     */
    @Transactional(readOnly = true)
    public boolean isAlreadyReported(Long reporterId, String targetType, Long targetId) {
        return reportRepository.existsByReporterIdAndTargetTypeAndTargetId(reporterId, targetType, targetId);
    }
}
