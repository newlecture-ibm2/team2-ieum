package com.ieum.user.auth.adapter.in.web.dto;

import com.ieum.user.auth.domain.Role;
import com.ieum.user.auth.domain.User;
import lombok.Builder;
import lombok.Getter;

/**
 * 클라이언트에게 반환할 Response 객체 모음
 */
public class AuthRes {

    @Getter
    @Builder
    public static class TokenDto {
        private String accessToken;
        private String refreshToken;
        private long expiresIn;
        private String message;
        private UserDto user;
    }

    @Getter
    @Builder
    public static class UserDto {
        private Long userId;
        private String id;
        private String name;
        private String nickname;
        private String role;
        private String status;

        /**
         * 도메인 User 객체를 응답용 DTO로 변환
         */
        public static UserDto from(User user) {
            return UserDto.builder()
                    .userId(user.getUserId())
                    .id(user.getLoginId())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .role(user.getRole().name())
                    .status(user.getStatus().name())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class SessionDto {
        private boolean isLoggedIn;
        private UserInfoDto user;
    }

    @Getter
    @Builder
    public static class UserInfoDto {
        private String nickname;
        private String role;
        private String profileImage;
        private String status;
    }

    @Getter
    @Builder
    public static class PasswordRecoveryQuestion {
        private String question;
    }
}
