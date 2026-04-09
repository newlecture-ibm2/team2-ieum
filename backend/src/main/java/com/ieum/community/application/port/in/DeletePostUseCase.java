package com.ieum.community.application.port.in;

/**
 * 게시글 삭제 유스케이스 (Port IN)
 */
public interface DeletePostUseCase {

    void deletePost(Long postId, Long requesterId, boolean isAdmin);
}
