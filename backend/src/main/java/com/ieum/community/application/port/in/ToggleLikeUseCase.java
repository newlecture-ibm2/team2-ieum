package com.ieum.community.application.port.in;

/**
 * 게시글 좋아요 토글 유스케이스 (Port IN)
 */
public interface ToggleLikeUseCase {

    boolean toggleLike(Long postId, Long userId);
}
