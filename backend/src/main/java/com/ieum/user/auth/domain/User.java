package com.ieum.user.auth.domain;

import lombok.Getter;

/**
 * [Domain] 사용자 (비즈니스 객체)
 * 영속성(DB)나 웹 기술에 종속되지 않는 순수 도메인입니다.
 */
@Getter
public class User {

    private final Long id;
    private final String email;
    private final String password;
    private final String nickname;
    private final String phone;
    private final Role role;

    public User(Long id, String email, String password, String nickname, String phone, Role role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.phone = phone;
        this.role = role != null ? role : Role.USER;
    }

    /**
     * 비밀번호 검증 비즈니스 로직
     */
    public boolean checkPassword(String plainPassword, org.springframework.security.crypto.password.PasswordEncoder encoder) {
        return encoder.matches(plainPassword, this.password);
    }
}
