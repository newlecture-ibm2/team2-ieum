package com.ieum.community.adapter.out.persistence;

import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import com.ieum.community.adapter.out.persistence.repository.CommentJpaRepository;
import com.ieum.community.application.port.out.CommentPort;
import com.ieum.community.domain.model.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * 댓글 영속성 어댑터 (Port OUT 구현체)
 * - Service는 CommentPort만 바라보고, 이 어댑터가 실제 JPA를 호출
 */
@Component
@RequiredArgsConstructor
public class CommentPersistenceAdapter implements CommentPort {

    private final CommentJpaRepository commentJpaRepository;

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
        return commentJpaRepository.findRootCommentsByPostId(postId)
                .stream()
                .map(CommentEntity::toDomain)
                .toList();
    }

    @Override
    public long countActiveByPostId(Long postId) {
        return commentJpaRepository.countActiveByPostId(postId);
    }
}
