package com.ieum.community.application.service;

import com.ieum.community.application.port.in.*;
import com.ieum.community.application.port.out.CommentPort;
import com.ieum.community.application.port.out.PostPort;
import com.ieum.community.application.port.out.UserSuspensionCheckPort;
import com.ieum.community.domain.model.Comment;
import com.ieum.community.domain.model.Post;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import com.ieum.user.notification.application.port.in.SendNotificationUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 댓글 서비스 (UseCase 구현체)
 * - Input Port(UseCase) 인터페이스를 구현
 * - Output Port(CommentPort, PostPort)만 의존 (JPA Repository 직접 참조 없음)
 * - adapter.in.web 패키지의 DTO를 알지 못함
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommentService implements CreateCommentUseCase, LoadCommentUseCase, UpdateCommentUseCase, DeleteCommentUseCase {

    private final CommentPort commentPort;
    private final PostPort postPort;
    private final SendNotificationUseCase sendNotificationUseCase;
    private final UserSuspensionCheckPort userSuspensionCheckPort;

    /**
     * 정지 회원 검증 — WRITE 작업 전 호출
     */
    private void validateNotSuspended(Long userId) {
        if (userId != null && userSuspensionCheckPort.isSuspended(userId)) {
            throw new BusinessException(ErrorCode.USER_001,
                    "Suspended user attempted write operation. userId=" + userId);
        }
    }

    // ──── CreateCommentUseCase ────

    @Override
    public Comment createComment(Long postId, String content, Long parentId, Long userId, String userName) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "Comment creation requires authentication");
        }
        validateNotSuspended(userId);
        if (content == null || content.trim().isEmpty() || content.length() > 500) {
            throw new BusinessException(ErrorCode.COMMON_001, "댓글은 1자 이상 500자 이하로 작성해주세요.");
        }

        // 게시글 존재 여부 확인
        Post post = postPort.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        Comment parentComment = null;
        // 대댓글인 경우 부모 댓글 확인
        if (parentId != null) {
            parentComment = commentPort.findById(parentId)
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

        Comment saved = commentPort.save(comment);

        // 알림 전송 로직
        // 대댓글인 경우: 부모 댓글 작성자에게 알림
        // 최상위 댓글인 경우: 게시물 작성자에게 알림
        try {
            Long targetUserId = (parentComment != null) ? parentComment.getUserId() : post.getAuthorId();
            
            log.info("알림 전송 시도: targetUserId={}, requesterId={}", targetUserId, userId);

            // 본인이 쓴 글이나 본인 댓글에 작성할 때는 알림 제외
            if (targetUserId != null && !targetUserId.equals(userId)) {
                String title = (parentComment != null) ? "새로운 대댓글이 달렸습니다." : "새로운 댓글이 달렸습니다.";
                String msg = "작성자 " + userName + ": " + 
                             (content.length() > 20 ? content.substring(0, 20) + "..." : content);
                
                log.info("알림 발송 조건 충족: 발송 시작...");
                sendNotificationUseCase.sendNotification(
                        targetUserId,
                        "COMMENT",
                        "COMMUNITY",
                        postId,
                        title,
                        msg
                );
            } else {
                log.info("알림 발송 제외: 본인 글/댓글에 대한 작업입니다.");
            }
        } catch (Exception e) {
            log.error("알림 발송 중 오류 발생: {}", e.getMessage(), e);
            // 알림 발송 실패가 댓글 작성 자체를 롤백시키지 않도록 예외 처리
        }

        return saved;
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
        validateNotSuspended(requesterId);
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
        validateNotSuspended(requesterId);
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
