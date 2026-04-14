package com.ieum.user.notification.adapter.out.persistence.entity;

import com.ieum.user.notification.domain.model.FcmToken;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * FCM 토큰 JPA 엔티티
 */
@Entity
@Table(name = "fcm_tokens", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "token"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class FcmTokenJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token", length = 500, nullable = false)
    private String token;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FcmToken toDomain() {
        return FcmToken.builder()
                .id(this.id)
                .userId(this.userId)
                .token(this.token)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

    public static FcmTokenJpaEntity fromDomain(FcmToken fcmToken) {
        return FcmTokenJpaEntity.builder()
                .id(fcmToken.getId())
                .userId(fcmToken.getUserId())
                .token(fcmToken.getToken())
                .createdAt(fcmToken.getCreatedAt())
                .updatedAt(fcmToken.getUpdatedAt())
                .build();
    }
}
