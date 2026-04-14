package com.ieum.community.application.port.out;

import com.ieum.community.domain.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 게시글 영속성 포트 (Port OUT)
 * - Service가 이 인터페이스를 호출, PersistenceAdapter가 구현
 */
public interface PostPort {

    Post save(Post post);

    Optional<Post> findById(Long postId);

    Optional<Post> findActiveById(Long postId);

    Page<Post> findByFilters(String category, String areaCode, String keyword, Pageable pageable);

    void deleteById(Long postId);
}
