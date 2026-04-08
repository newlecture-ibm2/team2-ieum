package com.ieum.community.application.service;

import com.ieum.community.application.port.in.*;
import com.ieum.community.application.port.out.CommentPort;
import com.ieum.community.application.port.out.PostPort;
import com.ieum.community.domain.model.Comment;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 댓글 서비스 (UseCase 구현체)
 * - Input Port(UseCase) 인터페이스를 구현
 * - Output Port(CommentPort, PostPort)만 의존 (JPA Repository 직접 참조 없음)
 * - adapter.in.web 패키지의 DTO를 알지 못함
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CommentService implements CreateCommentUseCase, LoadCommentUseCase, UpdateCommentUseCase, DeleteCommentUseCase {

    private final CommentPort commentPort;
    private final PostPort postPort;

    // ──── CreateCommentUseCase ────

    @Override
    public Comment createComment(Long postId, String content, Long parentId, Long userId, String userName) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "Comment creation requires authentication");
        }
        if (content == null || content.trim().isEmpty() || content.length() > 500) {
            throw new BusinessException(ErrorCode.COMMON_001, "댓글은 1자 이상 500자 이하로 작성해주세요.");
        }

        // 게시글 존재 여부 확인
        postPort.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        // 대댓글인 경우 부모 댓글 확인
        if (parentId != null) {
            Comment parentComment = commentPort.findById(parentId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_001,
                            "Parent comment ID: " + parentId));

            if (!parentComment.getPostId().equals(postId)) {
                throw new BusinessException(ErrorCode.COMMON_001,
                        "Parent comment does not belong to post ID: " + postId);
            }
        }

        Comment comment = Comment.builder()
                .postId(postId)
                .userId(userId)
                .userName(userName)
                .parentId(parentId)
                .content(content)
                .status("ACTIVE")
                .build();

        return commentPort.save(comment);
    }

    // ──── LoadCommentUseCase ────

    @Override
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByPostId(Long postId) {
        postPort.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        return commentPort.findRootCommentsByPostId(postId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getCommentCount(Long postId) {
        return commentPort.countActiveByPostId(postId);
    }

    // ──── UpdateCommentUseCase ────

    @Override
    public Comment updateComment(Long commentId, String content, Long requesterId, boolean isAdmin) {
        if (content == null || content.trim().isEmpty() || content.length() > 500) {
            throw new BusinessException(ErrorCode.COMMON_001, "댓글은 1자 이상 500자 이하로 작성해주세요.");
        }

        Comment comment = commentPort.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_001, "Comment ID: " + commentId));

        if (!comment.isActive()) {
            throw new BusinessException(ErrorCode.COMMENT_001, "Comment is already deleted: " + commentId);
        }

        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + comment.getUserId());
        }

        comment.updateContent(content);
        return commentPort.save(comment);
    }

    // ──── DeleteCommentUseCase ────

    @Override
    public void deleteComment(Long commentId, Long requesterId, boolean isAdmin) {
        Comment comment = commentPort.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_001, "Comment ID: " + commentId));

        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + comment.getUserId());
        }

        comment.softDelete();
        commentPort.save(comment);
    }
}
