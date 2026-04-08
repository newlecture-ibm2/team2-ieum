package com.ieum.community.adapter.out.persistence;

import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import com.ieum.community.adapter.out.persistence.repository.PostJpaRepository;
import com.ieum.community.application.port.out.PostPort;
import com.ieum.community.domain.model.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 게시글 영속성 어댑터 (Port OUT 구현체)
 * - Service는 PostPort만 바라보고, 이 어댑터가 실제 JPA를 호출
 */
@Component
@RequiredArgsConstructor
public class PostPersistenceAdapter implements PostPort {

    private final PostJpaRepository postJpaRepository;

    @Override
    public Post save(Post post) {
        PostEntity entity = PostEntity.fromDomain(post);
        return postJpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<Post> findById(Long postId) {
        return postJpaRepository.findById(postId)
                .map(PostEntity::toDomain);
    }

    @Override
    public Optional<Post> findActiveById(Long postId) {
        return postJpaRepository.findActiveById(postId)
                .map(PostEntity::toDomain);
    }

    @Override
    public Page<Post> findByFilters(String category, String areaCode, String keyword, Pageable pageable) {
        return postJpaRepository.findByFilters(category, areaCode, keyword, pageable)
                .map(PostEntity::toDomain);
    }

    @Override
    public void deleteById(Long postId) {
        postJpaRepository.deleteById(postId);
    }
}
