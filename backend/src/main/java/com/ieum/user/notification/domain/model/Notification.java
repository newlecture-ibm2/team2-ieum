package com.ieum.user.notification.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 알림 도메인 모델 및 JPA 엔티티
 */
@Entity(name = "Notification")
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * FESTIVAL_START / FESTIVAL_END / NOTICE / COMMENT
     */
    @Column(name = "type", length = 20, nullable = false)
    private String type;

    @Column(name = "message", length = 500)
    private String message;

    @Builder.Default
    @Column(name = "is_read")
    private Boolean isRead = false;

    /**
     * FESTIVAL / NOTICE / POST
     */
    @Column(name = "target_type", length = 10)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
