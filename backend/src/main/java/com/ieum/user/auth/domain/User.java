package com.ieum.user.auth.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * [Domain] 사용자 (비즈니스 객체)
 */
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
public class User {

    private final Long userId;
    private final String loginId;
    private final String password;
    private final String name;
    private final String nickname;
    private final String phone;
    private final String profileImage;
    private final String role;
    private final boolean termsAgreed;
    private final boolean marketingAgreed;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final LocalDateTime deletedAt;
    private final LocalDateTime suspendedUntil;

    /**
     * 비밀번호 검증 비즈니스 로직
     */
    public boolean checkPassword(String plainPassword, org.springframework.security.crypto.password.PasswordEncoder encoder) {
        return encoder.matches(plainPassword, this.password);
    }

    /**
     * 회원 탈퇴 처리 (유예 기간 시작)
     */
    public User withdraw() {
        return this.toBuilder()
                .status("WITHDRAWAL")
                .deletedAt(LocalDateTime.now())
                .build();
    }

    /**
     * 회원 계정 복구 (유예 기간 내 복귀)
     */
    public User reactivate() {
        return this.toBuilder()
                .status("ACTIVE")
                .deletedAt(null)
                .build();
    }

    /**
     * 탈퇴 유예 기간(30일) 만료 여부 확인
     */
    public boolean isWithdrawalExpired() {
        if (!"WITHDRAWAL".equals(this.status) || this.deletedAt == null) {
            return false;
        }
        return this.deletedAt.plusDays(30).isBefore(LocalDateTime.now());
    }

    /**
     * 정지 상태 여부 확인
     * 배치 스케쥴러가 정지 해제 시 status를 ACTIVE로 변경하므로 status만 확인
     */
    public boolean isSuspended() {
        return "SUSPENDED".equals(this.status);
    }
}
