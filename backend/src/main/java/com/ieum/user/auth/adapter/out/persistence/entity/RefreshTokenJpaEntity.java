package com.ieum.user.auth.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshTokenJpaEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 500)
    private String token;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public RefreshTokenJpaEntity(Long userId, String token) {
        this.userId = userId;
        this.token = token;
    }

    public void updateToken(String token) {
        this.token = token;
    }
}
