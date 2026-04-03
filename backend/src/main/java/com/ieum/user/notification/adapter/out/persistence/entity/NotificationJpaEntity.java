package com.ieum.user.notification.adapter.out.persistence.entity;

import com.ieum.user.notification.domain.model.Notification;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 알림 JPA 엔티티
 */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class NotificationJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "type", length = 20, nullable = false)
    private String type;

    @Column(name = "message", length = 500)
    private String message;

    @Builder.Default
    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "target_type", length = 10)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Notification toDomain() {
        return Notification.builder()
                .id(this.id)
                .userId(this.userId)
                .type(this.type)
                .message(this.message)
                .isRead(this.isRead)
                .targetType(this.targetType)
                .targetId(this.targetId)
                .createdAt(this.createdAt)
                .build();
    }

    public static NotificationJpaEntity fromDomain(Notification notification) {
        return NotificationJpaEntity.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .targetType(notification.getTargetType())
                .targetId(notification.getTargetId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
