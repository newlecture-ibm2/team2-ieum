package com.ieum.admin.report.adapter.out.persistence.entity;

import com.ieum.admin.report.domain.model.Report;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 신고 JPA Entity (adapter/out 에만 존재)
 * DDL: reports 테이블 기준
 */
@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "target_type", nullable = false)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(nullable = false)
    private String reason;

    private String description;

    @Column(nullable = false)
    private String status;

    private String action;

    @Column(name = "admin_note")
    private String adminNote;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /* ── JOIN 결과를 임시 보관 (쿼리에서 채움) ── */
    @Transient
    private String reporterNickname;

    /**
     * Entity → Domain 변환
     */
    public Report toDomain() {
        return Report.builder()
                .id(id)
                .targetType(targetType)
                .targetId(targetId)
                .reason(reason)
                .description(description)
                .status(status)
                .action(action)
                .adminNote(adminNote)
                .reporterId(reporterId)
                .reporterNickname(reporterNickname)
                .createdAt(createdAt)
                .processedAt(processedAt)
                .build();
    }
}
