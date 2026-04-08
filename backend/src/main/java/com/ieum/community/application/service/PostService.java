package com.ieum.community.application.service;

import com.ieum.community.adapter.in.web.dto.PostRequest;
import com.ieum.community.adapter.in.web.dto.PostResponse;
import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import com.ieum.community.adapter.out.persistence.entity.PostLikeEntity;
import com.ieum.community.adapter.out.persistence.repository.PostJpaRepository;
import com.ieum.community.adapter.out.persistence.repository.PostLikeJpaRepository;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostJpaRepository postJpaRepository;
    private final PostLikeJpaRepository postLikeJpaRepository;

    @Transactional
    public PostResponse createPost(PostRequest request, Long authorId, String authorName) {
        if (authorId == null) {
            throw new BusinessException(ErrorCode.AUTH_001, "Author ID is null");
        }

        PostEntity entity = PostEntity.builder()
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .areaCode(request.getAreaCode())
                .festivalId(request.getFestivalId())
                .festivalName(request.getFestivalName())
                .authorId(authorId)
                .authorName(authorName)
                .build();

        PostEntity saved = postJpaRepository.save(entity);
        return PostResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPosts(String category, String areaCode, String keyword, Pageable pageable) {
        // category가 ALL이나 빈문자열이면 null로 처리
        String queryCategory = (category != null && !category.isEmpty() && !category.equalsIgnoreCase("all")) ? category
                : null;
        String queryAreaCode = (areaCode != null && !areaCode.isEmpty() && !areaCode.equalsIgnoreCase("all")) ? areaCode
                : null;
        String queryKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<PostEntity> page = postJpaRepository.findByFilters(queryCategory, queryAreaCode, queryKeyword, pageable);
        return page.map(PostResponse::fromEntity);
    }

    @Transactional
    public PostResponse getPostDetail(Long postId, Long requesterId) {
        PostEntity entity = postJpaRepository.findActiveById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        entity.increaseViewCount();
        
        boolean isLiked = false;
        if (requesterId != null && requesterId > 0) {
            isLiked = postLikeJpaRepository.existsByPostIdAndUserId(postId, requesterId);
        }
        
        return PostResponse.fromEntity(entity).withIsLiked(isLiked);
    }
    
    @Transactional
    public boolean toggleLike(Long postId, Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        
        PostEntity post = postJpaRepository.findActiveById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));
                
        var existingLike = postLikeJpaRepository.findByPostIdAndUserId(postId, userId);
        
        if (existingLike.isPresent()) {
            postLikeJpaRepository.delete(existingLike.get());
            post.decreaseLikeCount();
            return false; // 좋아요 취소됨
        } else {
            postLikeJpaRepository.save(PostLikeEntity.builder()
                    .postId(postId)
                    .userId(userId)
                    .build());
            post.increaseLikeCount();
            return true; // 좋아요 추가됨
        }
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest request, Long requesterId, boolean isAdmin) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        if (!isAdmin && !entity.getAuthorId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + entity.getAuthorId());
        }

        entity.update(request.getCategory(), request.getTitle(), request.getContent(), request.getAreaCode(), request.getFestivalId(), request.getFestivalName());
        return PostResponse.fromEntity(entity);
    }

    @Transactional
    public void deletePost(Long postId, Long requesterId, boolean isAdmin) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        if (!isAdmin && !entity.getAuthorId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + entity.getAuthorId());
        }

        postJpaRepository.delete(entity);
    }
}
