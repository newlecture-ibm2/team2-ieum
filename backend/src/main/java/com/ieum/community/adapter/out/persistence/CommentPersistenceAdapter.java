package com.ieum.community.adapter.out.persistence;

import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import com.ieum.community.adapter.out.persistence.repository.CommentJpaRepository;
import com.ieum.community.adapter.out.persistence.repository.PostJpaRepository;
import com.ieum.community.application.port.out.CommentPort;
import com.ieum.community.domain.model.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 댓글 영속성 어댑터 (Port OUT 구현체)
 * - Service는 CommentPort만 바라보고, 이 어댑터가 실제 JPA를 호출
 * - 닉네임은 users 테이블에서 실시간으로 조회하여 최신 값을 반영
 */
@Component
@RequiredArgsConstructor
public class CommentPersistenceAdapter implements CommentPort {

    private final CommentJpaRepository commentJpaRepository;
    private final PostJpaRepository postJpaRepository; // 닉네임 조회용

    @Override
    public Comment save(Comment comment) {
        CommentEntity entity = CommentEntity.fromDomain(comment);

        // 부모 댓글이 있는 경우 parent 설정
        if (comment.getParentId() != null) {
            CommentEntity parent = commentJpaRepository.findById(comment.getParentId())
                    .orElse(null);
            if (parent != null) {
                entity = CommentEntity.builder()
                        .id(entity.getId())
                        .postId(entity.getPostId())
                        .userId(entity.getUserId())
                        .userName(entity.getUserName())
                        .content(entity.getContent())
                        .status(entity.getStatus())
                        .parent(parent)
                        .build();
            }
        }

        return commentJpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<Comment> findById(Long commentId) {
        return commentJpaRepository.findById(commentId)
                .map(CommentEntity::toDomain);
    }

    @Override
    public List<Comment> findRootCommentsByPostId(Long postId) {
        List<Comment> rootComments = commentJpaRepository.findRootCommentsByPostId(postId)
                .stream()
                .map(CommentEntity::toDomain)
                .toList();

        // 루트 댓글 + 대댓글의 모든 userId를 수집
        Set<Long> allUserIds = new HashSet<>();
        for (Comment root : rootComments) {
            collectUserIds(root, allUserIds);
        }

        if (allUserIds.isEmpty()) return rootComments;

        // users 테이블에서 최신 닉네임 일괄 조회
        Map<Long, String> nicknameMap = resolveNicknames(allUserIds);

        // 루트 댓글 + 대댓글 전체에 최신 닉네임 반영
        return rootComments.stream()
                .map(comment -> rebuildCommentTreeWithNicknames(comment, nicknameMap))
                .toList();
    }

    @Override
    public long countActiveByPostId(Long postId) {
        return commentJpaRepository.countActiveByPostId(postId);
    }

    // ─── 닉네임 실시간 조회 헬퍼 메서드 ───

    /**
     * 댓글 트리에서 모든 userId를 재귀적으로 수집
     */
    private void collectUserIds(Comment comment, Set<Long> userIds) {
        userIds.add(comment.getUserId());
        if (comment.getChildren() != null) {
            for (Comment child : comment.getChildren()) {
                collectUserIds(child, userIds);
            }
        }
    }

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
     * 댓글 트리 전체(루트 + 모든 대댓글)에 최신 닉네임을 재귀적으로 반영
     */
    private Comment rebuildCommentTreeWithNicknames(Comment comment, Map<Long, String> nicknameMap) {
        String latestNickname = nicknameMap.getOrDefault(comment.getUserId(), comment.getUserName());

        List<Comment> updatedChildren = new ArrayList<>();
        if (comment.getChildren() != null) {
            for (Comment child : comment.getChildren()) {
                updatedChildren.add(rebuildCommentTreeWithNicknames(child, nicknameMap));
            }
        }

        return Comment.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .userName(latestNickname)       // ← 최신 닉네임 반영!
                .parentId(comment.getParentId())
                .content(comment.getContent())
                .status(comment.getStatus())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .children(updatedChildren)
                .build();
    }
}
