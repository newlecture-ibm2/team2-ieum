package com.ieum.community.application.port.out;

import java.util.Optional;

/**
 * 게시글 좋아요 영속성 포트 (Port OUT)
 */
public interface PostLikePort {

    void save(Long postId, Long userId);

    void delete(Long postId, Long userId);

    boolean exists(Long postId, Long userId);

    Optional<Long> findIdByPostIdAndUserId(Long postId, Long userId);
}
