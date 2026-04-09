package com.ieum.community.application.service;

import com.ieum.community.application.port.in.*;
import com.ieum.community.application.port.out.PostPort;
import com.ieum.community.application.port.out.PostLikePort;
import com.ieum.community.domain.model.Post;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 게시글 서비스 (UseCase 구현체)
 * - Input Port(UseCase) 인터페이스를 구현
 * - Output Port(PostPort, PostLikePort)만 의존 (JPA Repository 직접 참조 없음)
 * - adapter.in.web 패키지의 DTO를 알지 못함
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PostService implements CreatePostUseCase, LoadPostUseCase, UpdatePostUseCase, DeletePostUseCase, ToggleLikeUseCase {

    private final PostPort postPort;
    private final PostLikePort postLikePort;

    // ──── CreatePostUseCase ────

    @Override
    public Post createPost(String category, String title, String content,
                           String areaCode, String festivalId, String festivalName,
                           Long authorId, String authorName) {
        if (authorId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "Author ID is null");
        }
        if (title == null || title.length() < 2 || title.length() > 200) {
            throw new BusinessException(ErrorCode.COMMON_001, "제목은 2자 이상 200자 이하로 작성해주세요.");
        }
        if (content == null || content.length() < 10 || content.length() > 5000) {
            throw new BusinessException(ErrorCode.COMMON_001, "내용은 10자 이상 5000자 이하로 작성해주세요.");
        }

        Post post = Post.builder()
                .category(category)
                .title(title)
                .content(content)
                .areaCode(areaCode)
                .festivalId(festivalId)
                .festivalName(festivalName)
                .authorId(authorId)
                .authorName(authorName)
                .status("ACTIVE")
                .build();

        return postPort.save(post);
    }

    // ──── LoadPostUseCase ────

    @Override
    @Transactional(readOnly = true)
    public Page<Post> getPosts(String category, String areaCode, String keyword, Pageable pageable) {
        String queryCategory = (category != null && !category.isEmpty() && !category.equalsIgnoreCase("all")) ? category : null;
        String queryAreaCode = (areaCode != null && !areaCode.isEmpty() && !areaCode.equalsIgnoreCase("all")) ? areaCode : null;
        String queryKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        return postPort.findByFilters(queryCategory, queryAreaCode, queryKeyword, pageable);
    }

    @Override
    public Post getPostDetail(Long postId, Long requesterId) {
        Post post = postPort.findActiveById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        post.increaseViewCount();
        postPort.save(post);

        boolean isLiked = false;
        if (requesterId != null && requesterId > 0) {
            isLiked = postLikePort.exists(postId, requesterId);
        }

        return post.withIsLiked(isLiked);
    }

    // ──── UpdatePostUseCase ────

    @Override
    public Post updatePost(Long postId, String category, String title, String content,
                           String areaCode, String festivalId, String festivalName,
                           Long requesterId, boolean isAdmin) {
        if (title == null || title.length() < 2 || title.length() > 200) {
            throw new BusinessException(ErrorCode.COMMON_001, "제목은 2자 이상 200자 이하로 작성해주세요.");
        }
        if (content == null || content.length() < 10 || content.length() > 5000) {
            throw new BusinessException(ErrorCode.COMMON_001, "내용은 10자 이상 5000자 이하로 작성해주세요.");
        }

        Post post = postPort.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        if (!isAdmin && !post.getAuthorId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + post.getAuthorId());
        }

        post.update(category, title, content, areaCode, festivalId, festivalName);
        return postPort.save(post);
    }

    // ──── DeletePostUseCase ────

    @Override
    public void deletePost(Long postId, Long requesterId, boolean isAdmin) {
        Post post = postPort.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        if (!isAdmin && !post.getAuthorId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + post.getAuthorId());
        }

        postPort.deleteById(postId);
    }

    // ──── ToggleLikeUseCase ────

    @Override
    public boolean toggleLike(Long postId, Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        Post post = postPort.findActiveById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        boolean alreadyLiked = postLikePort.exists(postId, userId);

        if (alreadyLiked) {
            postLikePort.delete(postId, userId);
            post.decreaseLikeCount();
        } else {
            postLikePort.save(postId, userId);
            post.increaseLikeCount();
        }

        postPort.save(post);
        return !alreadyLiked;
    }
}
