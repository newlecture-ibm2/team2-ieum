package com.ieum.user.deletion.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 회원 물리 파기 시 Reports(신고) 데이터 보존용 로그 테이블
 * - 외래키(FK) 설정 절대 금지
 */
@Entity
@Table(name = "report_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReportHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_id", nullable = false)
    private Long originalId;

    // 작성자 ID 단순 보관
    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "target_type", nullable = false)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(nullable = false)
    private String reason;

    private String description;

    @Column(length = 20)
    private String status;

    private String action;

    @Column(name = "admin_note")
    private String adminNote;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 고정값: USER_HARD_DELETE
    @Column(name = "deleted_reason", length = 30)
    private String deletedReason;

    // 파기 일시 기록
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        this.deletedAt = LocalDateTime.now();
        this.deletedReason = "USER_HARD_DELETE";
    }
}
