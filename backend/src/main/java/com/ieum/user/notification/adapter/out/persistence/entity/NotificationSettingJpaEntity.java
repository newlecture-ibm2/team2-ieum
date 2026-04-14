package com.ieum.user.notification.adapter.out.persistence.entity;

import com.ieum.user.notification.domain.model.NotificationSetting;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 알림 설정 JPA 엔티티
 */
@Entity
@Table(name = "notification_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class NotificationSettingJpaEntity {

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

    public NotificationSetting toDomain() {
        return NotificationSetting.builder()
                .id(this.id)
                .userId(this.userId)
                .pushEnabled(this.pushEnabled)
                .festivalStart(this.festivalStart)
                .festivalEnd(this.festivalEnd)
                .notice(this.notice)
                .comment(this.comment)
                .updatedAt(this.updatedAt)
                .build();
    }

    public static NotificationSettingJpaEntity fromDomain(NotificationSetting setting) {
        return NotificationSettingJpaEntity.builder()
                .id(setting.getId())
                .userId(setting.getUserId())
                .pushEnabled(setting.getPushEnabled())
                .festivalStart(setting.getFestivalStart())
                .festivalEnd(setting.getFestivalEnd())
                .notice(setting.getNotice())
                .comment(setting.getComment())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}
