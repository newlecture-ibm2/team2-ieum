package com.ieum.user.auth.adapter.in.web.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 사용자로부터 입력받는 Request 객체 모음
 */
public class AuthReq {

    @Getter
    @Setter
    public static class Login {
        private String email;
        private String password;
    }

    @Getter
    @Setter
    public static class Register {
        private String email;
        private String password;
        private String nickname;
        private String phone;
    }

    @Getter
    @Setter
    public static class Refresh {
        private String refreshToken;
    }
}
