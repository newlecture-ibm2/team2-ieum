package com.ieum.community.adapter.out.persistence;

import com.ieum.community.adapter.out.persistence.entity.PostLikeEntity;
import com.ieum.community.adapter.out.persistence.repository.PostLikeJpaRepository;
import com.ieum.community.application.port.out.PostLikePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 게시글 좋아요 영속성 어댑터 (Port OUT 구현체)
 */
@Component
@RequiredArgsConstructor
public class PostLikePersistenceAdapter implements PostLikePort {

    private final PostLikeJpaRepository postLikeJpaRepository;

    @Override
    public void save(Long postId, Long userId) {
        postLikeJpaRepository.save(PostLikeEntity.builder()
                .postId(postId)
                .userId(userId)
                .build());
    }

    @Override
    public void delete(Long postId, Long userId) {
        postLikeJpaRepository.findByPostIdAndUserId(postId, userId)
                .ifPresent(postLikeJpaRepository::delete);
    }

    @Override
    public boolean exists(Long postId, Long userId) {
        return postLikeJpaRepository.existsByPostIdAndUserId(postId, userId);
    }

    @Override
    public Optional<Long> findIdByPostIdAndUserId(Long postId, Long userId) {
        return postLikeJpaRepository.findByPostIdAndUserId(postId, userId)
                .map(PostLikeEntity::getId);
    }
}
