package com.ieum.community.application.service;

import com.ieum.community.adapter.in.web.dto.PostRequest;
import com.ieum.community.adapter.in.web.dto.PostResponse;
import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import com.ieum.community.adapter.out.persistence.repository.PostJpaRepository;
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
    public PostResponse getPostDetail(Long postId) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        entity.increaseViewCount();
        return PostResponse.fromEntity(entity);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest request, Long requesterId, boolean isAdmin) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_001, "Post ID: " + postId));

        if (!isAdmin && !entity.getAuthorId().equals(requesterId)) {
            throw new BusinessException(ErrorCode.AUTH_002,
                    "Requester: " + requesterId + ", Author: " + entity.getAuthorId());
        }

        entity.update(request.getCategory(), request.getTitle(), request.getContent(), request.getAreaCode());
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
