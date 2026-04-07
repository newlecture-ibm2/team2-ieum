package com.ieum.community.application.service;

import com.ieum.community.adapter.in.web.dto.CommentRequest;
import com.ieum.community.adapter.in.web.dto.CommentResponse;
import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import com.ieum.community.adapter.out.persistence.repository.CommentJpaRepository;
import com.ieum.community.adapter.out.persistence.repository.PostJpaRepository;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentJpaRepository commentJpaRepository;
    private final PostJpaRepository postJpaRepository;

    /**
     * 댓글 작성 (대댓글 포함)
     * - parentId가 null이면 최상위 댓글
     * - parentId가 있으면 해당 댓글에 대한 대댓글
     */
    @Transactional
    public CommentResponse createComment(Long postId, CommentRequest request, Long userId, String userName) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "Comment creation requires authentication");
        }

        // 게시글 존재 여부 확인
        postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        CommentEntity.CommentEntityBuilder builder = CommentEntity.builder()
                .postId(postId)
                .userId(userId)
                .userName(userName)
                .content(request.getContent());

        // 대댓글인 경우 부모 댓글 확인
        if (request.getParentId() != null) {
            CommentEntity parentComment = commentJpaRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_001,
                            "Parent comment ID: " + request.getParentId()));

            // 부모 댓글이 같은 게시글에 속하는지 검증
            if (!parentComment.getPostId().equals(postId)) {
                throw new BusinessException(ErrorCode.COMMON_001,
                        "Parent comment does not belong to post ID: " + postId);
            }

            builder.parent(parentComment);
        }

        CommentEntity saved = commentJpaRepository.save(builder.build());
        return CommentResponse.fromEntity(saved);
    }

    /**
     * 특정 게시글의 댓글 트리 조회
     * - 최상위 댓글을 먼저 가져오고, children이 JPA 연관관계로 자동 로딩됨
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        // 게시글 존재 여부 확인
        postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        List<CommentEntity> rootComments = commentJpaRepository.findRootCommentsByPostId(postId);

        return rootComments.stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 댓글 수정 (본인만 가능)
     */
    @Transactional
    public CommentResponse updateComment(Long commentId, String content, Long requesterId, boolean isAdmin) {
        CommentEntity comment = commentJpaRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_001, "Comment ID: " + commentId));

        if (!comment.isActive()) {
            throw new BusinessException(ErrorCode.COMMENT_001, "Comment is already deleted: " + commentId);
        }

        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + comment.getUserId());
        }

        comment.updateContent(content);
        return CommentResponse.fromEntity(comment);
    }

    /**
     * 댓글 삭제 (소프트 삭제)
     * - 대댓글이 있는 경우 "삭제된 댓글입니다." 로 표시되고 실제 삭제되지 않음
     * - 대댓글이 없는 경우에도 소프트 삭제 처리
     */
    @Transactional
    public void deleteComment(Long commentId, Long requesterId, boolean isAdmin) {
        CommentEntity comment = commentJpaRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_001, "Comment ID: " + commentId));

        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + comment.getUserId());
        }

        comment.softDelete();
    }

    /**
     * 특정 게시글의 활성 댓글 수
     */
    @Transactional(readOnly = true)
    public long getCommentCount(Long postId) {
        return commentJpaRepository.countActiveByPostId(postId);
    }
}
