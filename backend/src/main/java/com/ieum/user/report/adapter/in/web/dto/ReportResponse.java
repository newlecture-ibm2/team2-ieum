package com.ieum.user.report.adapter.in.web.dto;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 사용자 신고 응답 DTO (통합 — POST, COMMENT, REVIEW 공통)
 */
@Getter
@Builder
public class ReportResponse {

    private Long id;
    private String targetType;
    private Long targetId;
    private String reason;
    private String description;
    private String status;
    private LocalDateTime createdAt;

    public static ReportResponse fromEntity(ReportEntity entity) {
        return ReportResponse.builder()
                .id(entity.getId())
                .targetType(entity.getTargetType())
                .targetId(entity.getTargetId())
                .reason(entity.getReason())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
