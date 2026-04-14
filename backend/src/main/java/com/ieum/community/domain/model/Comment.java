package com.ieum.community.domain.model;

import com.ieum.global.common.enums.ContentStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 댓글 도메인 모델 (순수 자바 객체)
 * - JPA, Spring 의존성 없음
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    private Long id;
    private Long postId;
    private Long userId;
    private String userName;
    private String userProfileImage;
    private Long parentId;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<Comment> children = new ArrayList<>();

    // ─── 비즈니스 로직 ───

    public void updateContent(String content) {
        this.content = content;
    }

    public void softDelete() {
        this.status = ContentStatus.REMOVED.name();
        this.content = "삭제된 댓글입니다.";
    }

    public boolean isActive() {
        return ContentStatus.ACTIVE.name().equals(this.status);
    }
}
