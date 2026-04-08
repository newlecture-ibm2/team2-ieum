package com.ieum.user.mypage.adapter.in.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 마이페이지 응답 객체 모음 (기능 설계서 규격 준수)
 */
public class MyPageRes {

    @Getter
    @Builder
    public static class ActivityList {
        private List<ActivityDto> items;
        private int totalPages;
        private long totalElements;
    }

    @Getter
    @Builder
    public static class ActivityDto {
        private Long id;
        private String summary;
        private String createdAt;
        private String type; // posts / reviews / comments
    }

    @Getter
    @Builder
    public static class ProfileUpdate {
        private String updatedAt;
    }
}
