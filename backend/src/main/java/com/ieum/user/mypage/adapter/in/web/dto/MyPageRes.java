package com.ieum.user.mypage.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 마이페이지 응답 객체 모음 (기능 설계서 규격 준수)
 */
public class MyPageRes {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityList {
        private List<ActivityDto> activities;
        private int totalPages;
        private long totalElements;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityDto {
        private Long id;
        private String title;
        private String content;
        private String summary;
        private String createdAt;
        private String type; // posts / reviews / comments
        
        // 추가 정보 필드 (리뷰 및 댓글 등에서 사용)
        private String festivalName;
        private Integer rating;
        private String location;
        private Long postId;
        private String postTitle;
        private Long festivalId;

        // 문의 및 신고 관련 필드
        private String status;
        private String answer;
        private String answeredAt;
        private String targetType;
        private Long targetId;
        private Long targetParentId;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileUpdate {
        private String updatedAt;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileInfo {
        private String nickname;
        private String profileImageUrl;
    }
}
