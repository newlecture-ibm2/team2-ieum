package com.ieum.community.adapter.in.web.dto;

import com.ieum.community.domain.model.Comment;
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
    private String userProfileImage;
    private Long parentId;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> children;

    public static CommentResponse fromDomain(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .userName(comment.getUserName())
                .userProfileImage(comment.getUserProfileImage())
                .parentId(comment.getParentId())
                .content(comment.getContent())
                .status(comment.getStatus())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .children(
                    comment.getChildren() != null
                        ? comment.getChildren().stream()
                            .map(CommentResponse::fromDomain)
                            .collect(Collectors.toList())
                        : List.of()
                )
                .build();
    }
}
