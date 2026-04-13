package com.ieum.user.auth.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * 사용자로부터 입력받는 Request 객체 모음
 */
public class AuthReq {

    @Getter
    @Setter
    public static class Login {
        private String id;
        private String password;
    }

    @Getter
    @Setter
    public static class Register {
        private String id;
        private String password;
        private String name;

        @NotBlank(message = "닉네임은 필수 입력 항목입니다.")
        @Size(min = 2, max = 8, message = "닉네임은 2자 이상 8자 이하로 입력해주세요.")
        private String nickname;

        private String phone;
        private boolean termsAgreed;
    }

    @Getter
    @Setter
    public static class Refresh {
        private String refreshToken;
    }

    /** 비밀번호 찾기: 1단계 아이디 및 전화번호 입력 */
    @Getter
    @Setter
    public static class PasswordRecoveryRequest {
        private String id;
        private String phone;
    }

    /** 비밀번호 찾기: 2단계 인증 코드 확인 (아이디 기준) */
    @Getter
    @Setter
    public static class PasswordRecoveryVerify {
        private String id;
        private String code;
    }

    /** 비밀번호 찾기: 3단계 비밀번호 재설정 (아이디 기준) */
    @Getter
    @Setter
    public static class PasswordReset {
        private String id;
        private String newPassword;
    }

    /** 회원 탈퇴: 비밀번호 확인 */
    @Getter
    @Setter
    public static class Withdraw {
        private String password;
    }
}
