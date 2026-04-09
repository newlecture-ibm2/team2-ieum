package com.ieum.community.application.port.out;

import com.ieum.community.domain.model.Comment;

import java.util.List;
import java.util.Optional;

/**
 * 댓글 영속성 포트 (Port OUT)
 * - Service가 이 인터페이스를 호출, PersistenceAdapter가 구현
 */
public interface CommentPort {

    Comment save(Comment comment);

    Optional<Comment> findById(Long commentId);

    List<Comment> findRootCommentsByPostId(Long postId);

    long countActiveByPostId(Long postId);
}
