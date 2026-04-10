package com.ieum.user.auth.adapter.out.persistence.entity;

import com.ieum.user.auth.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "login_id", nullable = false, length = 100, unique = true)
    private String loginId;

    @Column(nullable = true)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 20, unique = true)
    private String nickname;

    @Column(length = 20)
    private String phone;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(nullable = false, length = 10)
    private String role = "USER";

    @Column(name = "terms_agreed", nullable = false)
    private boolean termsAgreed;

    @Column(nullable = false, length = 10)
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "suspended_until")
    private LocalDateTime suspendedUntil;

    @Builder
    public UserJpaEntity(Long userId, String loginId, String password, String name, String nickname, String phone, String profileImage, String role, boolean termsAgreed, boolean marketingAgreed, String status, LocalDateTime deletedAt, LocalDateTime suspendedUntil) {
        this.userId = userId;
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
        this.phone = phone;
        this.profileImage = profileImage;
        this.role = role != null ? role : "USER";
        this.termsAgreed = termsAgreed;
        this.status = status != null ? status : "ACTIVE";
        this.deletedAt = deletedAt;
        this.suspendedUntil = suspendedUntil;
    }

    public User toDomain() {
        return User.builder()
                .userId(this.userId)
                .loginId(this.loginId)
                .password(this.password)
                .name(this.name)
                .nickname(this.nickname)
                .phone(this.phone)
                .profileImage(this.profileImage)
                .role(this.role)
                .termsAgreed(this.termsAgreed)
                .status(this.status)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .deletedAt(this.deletedAt)
                .suspendedUntil(this.suspendedUntil)
                .build();
    }

    public static UserJpaEntity fromDomain(User user) {
        return UserJpaEntity.builder()
                .userId(user.getUserId())
                .loginId(user.getLoginId())
                .password(user.getPassword())
                .name(user.getName())
                .nickname(user.getNickname())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .termsAgreed(user.isTermsAgreed())
                .status(user.getStatus())
                .deletedAt(user.getDeletedAt())
                .suspendedUntil(user.getSuspendedUntil())
                .build();
    }
}
