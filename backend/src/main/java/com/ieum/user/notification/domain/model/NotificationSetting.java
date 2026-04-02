package com.ieum.user.notification.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 알림 설정 도메인 모델 및 JPA 엔티티
 * - 사용자당 1건 (1:1 관계)
 */
@Entity(name = "NotificationSetting")
@Table(name = "notification_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "setting_id")
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Builder.Default
    @Column(name = "push_enabled")
    private Boolean pushEnabled = true;

    @Builder.Default
    @Column(name = "festival_start")
    private Boolean festivalStart = true;

    @Builder.Default
    @Column(name = "festival_end")
    private Boolean festivalEnd = true;

    @Builder.Default
    @Column(name = "notice")
    private Boolean notice = true;

    @Builder.Default
    @Column(name = "comment")
    private Boolean comment = true;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
