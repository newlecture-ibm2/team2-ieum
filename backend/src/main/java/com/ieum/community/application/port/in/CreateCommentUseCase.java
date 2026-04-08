package com.ieum.community.application.port.in;

import com.ieum.community.domain.model.Comment;

/**
 * 댓글 작성 유스케이스 (Port IN)
 */
public interface CreateCommentUseCase {

    Comment createComment(Long postId, String content, Long parentId, Long userId, String userName);
}
