package com.ieum.user.report.adapter.out.persistence.entity;

import com.ieum.user.report.domain.model.Report;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(nullable = false, length = 50)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 20)
    private String action;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @PrePersist
    public void prePersist() {
        if (this.status == null) this.status = "PENDING";
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    public static UserReportEntity fromDomain(Report report) {
        return UserReportEntity.builder()
                .id(report.getId())
                .reporterId(report.getReporterId())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .action(report.getAction())
                .adminNote(report.getAdminNote())
                .createdAt(report.getCreatedAt())
                .processedAt(report.getProcessedAt())
                .build();
    }

    public Report toDomain() {
        return Report.builder()
                .id(this.id)
                .reporterId(this.reporterId)
                .targetType(this.targetType)
                .targetId(this.targetId)
                .reason(this.reason)
                .description(this.description)
                .status(this.status)
                .action(this.action)
                .adminNote(this.adminNote)
                .createdAt(this.createdAt)
                .processedAt(this.processedAt)
                .build();
    }
}
