package com.ieum.admin.member.adapter.out.persistence.entity;

import com.ieum.admin.member.domain.model.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 회원 JPA Entity (adapter/out 에만 존재)
 * DDL: users 테이블 기준
 * - 실제 UserJpaEntity(user 모듈)와 동일한 테이블을 읽기 전용으로 매핑
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "login_id", nullable = false, length = 100)
    private String loginId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 20)
    private String nickname;

    @Column(length = 20)
    private String phone;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(nullable = false, length = 10)
    private String role;

    @Column(nullable = false, length = 10)
    private String status;

    @Column(name = "suspended_until")
    private LocalDateTime suspendedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /* ── 신고 당한 횟수 (쿼리에서 채움, DB 컬럼 아님) ── */
    @Transient
    private long reportedCount;

    /**
     * Entity → Domain 변환
     */
    public Member toDomain() {
        return Member.builder()
                .userId(userId)
                .loginId(loginId)
                .name(name)
                .nickname(nickname)
                .phone(phone)
                .profileImage(profileImage)
                .role(role)
                .status(status)
                .suspendedUntil(suspendedUntil)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .deletedAt(deletedAt)
                .reportedCount(reportedCount)
                .build();
    }
}
