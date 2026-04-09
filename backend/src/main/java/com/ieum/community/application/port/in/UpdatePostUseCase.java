package com.ieum.community.application.port.in;

import com.ieum.community.domain.model.Post;

/**
 * 게시글 수정 유스케이스 (Port IN)
 */
public interface UpdatePostUseCase {

    Post updatePost(Long postId, String category, String title, String content,
                    String areaCode, String festivalId, String festivalName,
                    Long requesterId, boolean isAdmin);
}
