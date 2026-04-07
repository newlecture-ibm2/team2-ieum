package com.ieum.user.auth.adapter.in.web.dto;

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
        private UserDto user;
    }

    @Getter
    @Builder
    public static class UserDto {
        private Long id;
        private String loginId;
        private String nickname;
        private String role;
        private boolean isMarketingAgreed;

        /**
         * 도메인 User 객체를 응답용 DTO로 변환
         */
        public static UserDto from(User user) {
            return UserDto.builder()
                    .id(user.getId())
                    .loginId(user.getLoginId())
                    .nickname(user.getNickname())
                    .role(user.getRole().getKey())
                    .isMarketingAgreed(user.isMarketingAgreed())
                    .build();
        }
    }
}
