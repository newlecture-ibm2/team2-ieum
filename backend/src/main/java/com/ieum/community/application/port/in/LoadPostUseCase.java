package com.ieum.community.application.port.in;

import com.ieum.community.domain.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * 게시글 조회 유스케이스 (Port IN)
 */
public interface LoadPostUseCase {

    Post getPostDetail(Long postId, Long requesterId);

    Page<Post> getPosts(List<String> categories, List<String> areaCodes, String keyword, String searchType, Pageable pageable);
}
