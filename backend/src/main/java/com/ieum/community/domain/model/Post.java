package com.ieum.community.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 게시글 도메인 모델 (순수 자바 객체)
 * - JPA, Spring 의존성 없음
 * - 비즈니스 로직을 이 객체 안에서 캡슐화
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    private Long id;
    private String category;
    private String title;
    private String content;
    private String areaCode;
    private String festivalId;
    private String festivalName;
    private Long authorId;
    private String authorName;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private boolean isLiked;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ─── 비즈니스 로직 ───

    public void increaseViewCount() {
        this.viewCount++;
    }

    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    public void update(String category, String title, String content, String areaCode, String festivalId, String festivalName) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.areaCode = areaCode;
        this.festivalId = festivalId;
        this.festivalName = festivalName;
    }

    public void softDelete() {
        this.status = "REMOVED";
    }

    public boolean isActive() {
        return "ACTIVE".equals(this.status);
    }

    public Post withIsLiked(boolean isLiked) {
        this.isLiked = isLiked;
        return this;
    }
}
