package com.ieum.community.adapter.out.persistence;

import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import com.ieum.community.adapter.out.persistence.repository.PostJpaRepository;
import com.ieum.community.application.port.out.PostPort;
import com.ieum.community.domain.model.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 게시글 영속성 어댑터 (Port OUT 구현체)
 * - Service는 PostPort만 바라보고, 이 어댑터가 실제 JPA를 호출
 * - 닉네임은 users 테이블에서 실시간으로 조회하여 최신 값을 반영
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
                .map(entity -> {
                    Post post = entity.toDomain();
                    // 단건 조회 시에도 최신 닉네임으로 교체
                    Map<Long, String> nicknameMap = resolveNicknames(Set.of(post.getAuthorId()));
                    if (nicknameMap.containsKey(post.getAuthorId())) {
                        return rebuildWithNickname(post, nicknameMap.get(post.getAuthorId()));
                    }
                    return post;
                });
    }

    @Override
    public Page<Post> findByFilters(String category, String areaCode, String keyword, Pageable pageable) {
        Page<Post> postPage = postJpaRepository.findByFilters(category, areaCode, keyword, pageable)
                .map(PostEntity::toDomain);

        // 게시글 작성자 ID 수집 → users 테이블에서 최신 닉네임 일괄 조회
        Set<Long> authorIds = postPage.getContent().stream()
                .map(Post::getAuthorId)
                .collect(Collectors.toSet());

        if (authorIds.isEmpty()) return postPage;

        Map<Long, String> nicknameMap = resolveNicknames(authorIds);

        // 각 게시글의 authorName을 최신 닉네임으로 교체
        return postPage.map(post -> {
            String latestNickname = nicknameMap.get(post.getAuthorId());
            if (latestNickname != null) {
                return rebuildWithNickname(post, latestNickname);
            }
            return post;
        });
    }

    @Override
    public void deleteById(Long postId) {
        postJpaRepository.deleteById(postId);
    }

    // ─── 닉네임 실시간 조회 헬퍼 메서드 ───

    /**
     * 사용자 ID 목록으로 users 테이블에서 최신 닉네임을 일괄 조회
     */
    private Map<Long, String> resolveNicknames(Collection<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) return Collections.emptyMap();

        return postJpaRepository.findNicknamesByUserIds(userIds).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> (String) row[1],
                        (existing, replacement) -> replacement
                ));
    }

    /**
     * Post 도메인 객체의 authorName을 최신 닉네임으로 교체한 새 객체 반환
     */
    private Post rebuildWithNickname(Post post, String latestNickname) {
        return Post.builder()
                .id(post.getId())
                .category(post.getCategory())
                .title(post.getTitle())
                .content(post.getContent())
                .areaCode(post.getAreaCode())
                .festivalId(post.getFestivalId())
                .festivalName(post.getFestivalName())
                .authorId(post.getAuthorId())
                .authorName(latestNickname)       // ← 최신 닉네임 반영!
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .isLiked(post.isLiked())
                .status(post.getStatus())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
