package com.ieum.user.mypage.adapter.in.web.dto;

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
        private String nickname;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ProfileImageUpdate {
        private String base64Image;
    }
}
