package com.ieum.community.adapter.in.web.dto;

import com.ieum.community.domain.model.Post;
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

    public static PostResponse fromDomain(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .category(post.getCategory())
                .title(post.getTitle())
                .content(post.getContent())
                .areaCode(post.getAreaCode())
                .festivalId(post.getFestivalId())
                .festivalName(post.getFestivalName())
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .isLiked(post.isLiked())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
