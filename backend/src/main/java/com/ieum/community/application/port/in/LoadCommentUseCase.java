package com.ieum.community.application.port.in;

import com.ieum.community.domain.model.Comment;

import java.util.List;

/**
 * 댓글 조회 유스케이스 (Port IN)
 */
public interface LoadCommentUseCase {

    List<Comment> getCommentsByPostId(Long postId);

    long getCommentCount(Long postId);
}
