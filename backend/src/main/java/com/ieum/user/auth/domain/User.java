package com.ieum.user.auth.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * [Domain] 사용자 (비즈니스 객체)
 */
@Getter
@Builder
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

    /**
     * 비밀번호 검증 비즈니스 로직
     */
    public boolean checkPassword(String plainPassword, org.springframework.security.crypto.password.PasswordEncoder encoder) {
        return encoder.matches(plainPassword, this.password);
    }
}
