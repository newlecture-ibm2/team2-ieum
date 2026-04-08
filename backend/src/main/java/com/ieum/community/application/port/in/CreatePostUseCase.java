package com.ieum.community.application.port.in;

import com.ieum.community.domain.model.Post;

/**
 * 게시글 작성 유스케이스 (Port IN)
 */
public interface CreatePostUseCase {

    Post createPost(String category, String title, String content,
                    String areaCode, String festivalId, String festivalName,
                    Long authorId, String authorName);
}
