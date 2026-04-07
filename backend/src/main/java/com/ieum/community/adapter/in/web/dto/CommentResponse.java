package com.ieum.community.adapter.in.web.dto;

import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String userName;
    private Long parentId;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> children;

    public static CommentResponse fromEntity(CommentEntity entity) {
        return CommentResponse.builder()
                .id(entity.getId())
                .postId(entity.getPostId())
                .userId(entity.getUserId())
                .userName(entity.getUserName())
                .parentId(entity.getParent() != null ? entity.getParent().getId() : null)
                .content(entity.getContent())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .children(
                    entity.getChildren() != null
                        ? entity.getChildren().stream()
                            .map(CommentResponse::fromEntity)
                            .collect(Collectors.toList())
                        : List.of()
                )
                .build();
    }
}
