package com.ieum.user.mypage.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 마이페이지 요청 객체 모음
 */
public class MyPageReq {

    @Getter
    @Setter
    @NoArgsConstructor
    public static class UpdateProfile {
        @NotBlank(message = "닉네임은 필수 입력 항목입니다.")
        @Size(min = 2, max = 8, message = "닉네임은 2자 이상 8자 이하로 입력해주세요.")
        private String nickname;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ProfileImageUpdate {
        private String base64Image;
    }
}
