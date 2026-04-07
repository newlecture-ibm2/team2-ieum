package com.ieum.user.auth.domain;

import lombok.Getter;

/**
 * [Domain] 사용자 (비즈니스 객체)
 * 영속성(DB)나 웹 기술에 종속되지 않는 순수 도메인입니다.
 */
@Getter
public class User {

    private final Long id;
    private final String loginId;
    private final String password;
    private final String nickname;
    private final String phone;
    private final Role role;
    private final boolean isMarketingAgreed;

    public User(Long id, String loginId, String password, String nickname, String phone, Role role, boolean isMarketingAgreed) {
        this.id = id;
        this.loginId = loginId;
        this.password = password;
        this.nickname = nickname;
        this.phone = phone;
        this.role = role != null ? role : Role.USER;
        this.isMarketingAgreed = isMarketingAgreed;
    }

    /**
     * 비밀번호 검증 비즈니스 로직
     */
    public boolean checkPassword(String plainPassword, org.springframework.security.crypto.password.PasswordEncoder encoder) {
        return encoder.matches(plainPassword, this.password);
    }

    /**
     * 비밀번호가 변경된 새로운 도메인 객체 반환
     */
    public User withPassword(String encodedPassword) {
        return new User(id, loginId, encodedPassword, nickname, phone, role, isMarketingAgreed);
    }
}
