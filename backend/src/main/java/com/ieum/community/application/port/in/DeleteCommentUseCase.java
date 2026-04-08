package com.ieum.community.application.port.in;

/**
 * 댓글 삭제 유스케이스 (Port IN)
 */
public interface DeleteCommentUseCase {

    void deleteComment(Long commentId, Long requesterId, boolean isAdmin);
}
