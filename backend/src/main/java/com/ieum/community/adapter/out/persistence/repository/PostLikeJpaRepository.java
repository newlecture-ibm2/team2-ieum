package com.ieum.community.adapter.out.persistence.repository;

import com.ieum.community.adapter.out.persistence.entity.PostLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeJpaRepository extends JpaRepository<PostLikeEntity, Long> {
    Optional<PostLikeEntity> findByPostIdAndUserId(Long postId, Long userId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}
