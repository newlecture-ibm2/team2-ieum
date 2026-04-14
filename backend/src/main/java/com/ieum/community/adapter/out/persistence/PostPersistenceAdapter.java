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
                    // 단건 조회 시에도 최신 닉네임+프로필 이미지로 교체
                    Map<Long, String[]> userInfoMap = resolveUserInfo(Set.of(post.getAuthorId()));
                    if (userInfoMap.containsKey(post.getAuthorId())) {
                        String[] info = userInfoMap.get(post.getAuthorId());
                        return rebuildWithUserInfo(post, info[0], info[1]);
                    }
                    return post;
                });
    }

    @Override
    public Page<Post> findByFilters(String category, String areaCode, String keyword, Pageable pageable) {
        Page<Post> postPage = postJpaRepository.findByFilters(category, areaCode, keyword, pageable)
                .map(PostEntity::toDomain);

        // 게시글 작성자 ID 수집 → users 테이블에서 최신 닉네임+프로필 이미지 일괄 조회
        Set<Long> authorIds = postPage.getContent().stream()
                .map(Post::getAuthorId)
                .collect(Collectors.toSet());

        if (authorIds.isEmpty()) return postPage;

        Map<Long, String[]> userInfoMap = resolveUserInfo(authorIds);

        // 각 게시글의 authorName과 authorProfileImage를 최신으로 교체
        return postPage.map(post -> {
            String[] info = userInfoMap.get(post.getAuthorId());
            if (info != null) {
                return rebuildWithUserInfo(post, info[0], info[1]);
            }
            return post;
        });
    }

    @Override
    public void deleteById(Long postId) {
        postJpaRepository.deleteById(postId);
    }

    // ─── 사용자 정보 실시간 조회 헬퍼 메서드 ───

    /**
     * 사용자 ID 목록으로 users 테이블에서 최신 닉네임과 프로필 이미지를 일괄 조회
     * @return Map<userId, [nickname, profileImage]>
     */
    private Map<Long, String[]> resolveUserInfo(Collection<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) return Collections.emptyMap();

        return postJpaRepository.findUserInfoByUserIds(userIds).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> new String[]{ (String) row[1], (String) row[2] },
                        (existing, replacement) -> replacement
                ));
    }

    /**
     * Post 도메인 객체의 authorName과 authorProfileImage를 최신으로 교체한 새 객체 반환
     */
    private Post rebuildWithUserInfo(Post post, String latestNickname, String profileImage) {
        return Post.builder()
                .id(post.getId())
                .category(post.getCategory())
                .title(post.getTitle())
                .content(post.getContent())
                .areaCode(post.getAreaCode())
                .festivalId(post.getFestivalId())
                .festivalName(post.getFestivalName())
                .authorId(post.getAuthorId())
                .authorName(latestNickname)
                .authorProfileImage(profileImage)
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
