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
    private Long authorId;
    private String authorName;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PostResponse fromEntity(PostEntity entity) {
        return PostResponse.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .title(entity.getTitle())
                .content(entity.getContent())
                .areaCode(entity.getAreaCode())
                .authorId(entity.getAuthorId())
                .authorName(entity.getAuthorName())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
