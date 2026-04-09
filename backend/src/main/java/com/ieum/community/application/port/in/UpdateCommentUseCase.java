package com.ieum.community.application.port.in;

import com.ieum.community.domain.model.Comment;

/**
 * 댓글 수정 유스케이스 (Port IN)
 */
public interface UpdateCommentUseCase {

    Comment updateComment(Long commentId, String content, Long requesterId, boolean isAdmin);
}
