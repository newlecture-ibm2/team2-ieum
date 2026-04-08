package com.ieum.community.adapter.in.web.dto;

import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostResponse {
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PostResponse fromEntity(PostEntity entity) {
        return PostResponse.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .title(entity.getTitle())
                .content(entity.getContent())
                .areaCode(entity.getAreaCode())
                .festivalId(entity.getFestivalId())
                .festivalName(entity.getFestivalName())
                .authorId(entity.getAuthorId())
                .authorName(entity.getAuthorName())
                .viewCount(entity.getViewCount())
                .likeCount(entity.getLikeCount())
                .commentCount(entity.getCommentCount())
                .isLiked(false) // 기본값, Service에서 덮어씀
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public PostResponse withIsLiked(boolean isLiked) {
        return PostResponse.builder()
                .id(this.id)
                .category(this.category)
                .title(this.title)
                .content(this.content)
                .areaCode(this.areaCode)
                .festivalId(this.festivalId)
                .festivalName(this.festivalName)
                .authorId(this.authorId)
                .authorName(this.authorName)
                .viewCount(this.viewCount)
                .likeCount(this.likeCount)
                .commentCount(this.commentCount)
                .isLiked(isLiked)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }
}
