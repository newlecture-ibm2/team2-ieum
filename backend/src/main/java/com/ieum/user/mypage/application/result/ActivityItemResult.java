package com.ieum.user.mypage.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * [v18-0] 개별 활동 내역 결과 (Application Result)
 * - 게시글, 리뷰, 댓글 등을 하나로 아우르는 결과 객체
 */
@Getter
@Builder
@AllArgsConstructor
public class ActivityItemResult {

    private final Long id;
    private final String title;
    private final String content;
    private final String summary;
    private final String createdAt;
    private final String type; // posts / reviews / comments
    
    // 추가 정보 필드
    private final String festivalName;
    private final Integer rating;
    private final String location;
    private final Long postId;
    private final String postTitle;
    private final Long festivalId;

    // 문의 및 신고 관련 필드
    private final String status;
    private final String answer;
    private final String answeredAt;
    private final String targetType;
    private final Long targetId;
    private final Long targetParentId;
}
