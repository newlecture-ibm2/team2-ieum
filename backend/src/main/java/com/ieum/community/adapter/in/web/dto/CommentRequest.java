package com.ieum.community.adapter.in.web.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {
    private String content;
    private Long parentId; // null이면 최상위 댓글, 값이 있으면 대댓글
}
