package com.ieum.user.mypage.adapter.out.persistence;

import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageRes;
import com.ieum.user.mypage.application.port.out.LoadMyActivityPort;
import com.ieum.user.mypage.adapter.out.persistence.repository.MyPageCommentRepository;
import com.ieum.user.mypage.adapter.out.persistence.repository.MyPagePostRepository;
import com.ieum.user.mypage.adapter.out.persistence.repository.MyPageReviewRepository;
import com.ieum.user.review.adapter.out.persistence.entity.ReviewEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

/**
 * 어댑터: 마이페이지 전용 영속성 어댑터 (LoadMyActivityPort 구현)
 */
@Component
@RequiredArgsConstructor
public class MyPagePersistenceAdapter implements LoadMyActivityPort {

    private final MyPagePostRepository postRepository;
    private final MyPageCommentRepository commentRepository;
    private final MyPageReviewRepository reviewRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public MyPageRes.ActivityList loadMyPosts(Long userId, int page, int size) {
        Page<PostEntity> postPage = postRepository.findByAuthorId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        
        return MyPageRes.ActivityList.builder()
                .activities(postPage.getContent().stream()
                        .map(post -> MyPageRes.ActivityDto.builder()
                                .id(post.getId())
                                .title(post.getTitle())
                                .content(post.getContent())
                                .summary(post.getTitle()) 
                                .createdAt(post.getCreatedAt().format(formatter))
                                .type("posts")
                                .build())
                        .collect(Collectors.toList()))
                .totalPages(postPage.getTotalPages())
                .totalElements(postPage.getTotalElements())
                .build();
    }

    @Override
    public MyPageRes.ActivityList loadMyReviews(Long userId, int page, int size) {
        Page<ReviewEntity> reviewPage = reviewRepository.findByUserId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return MyPageRes.ActivityList.builder()
                .activities(reviewPage.getContent().stream()
                        .map(review -> MyPageRes.ActivityDto.builder()
                                .id(review.getId())
                                .title("리뷰 내역")
                                .content(review.getContent())
                                .summary(getSummary(review.getContent()))
                                .createdAt(review.getCreatedAt().format(formatter))
                                .type("reviews")
                                .build())
                        .collect(Collectors.toList()))
                .totalPages(reviewPage.getTotalPages())
                .totalElements(reviewPage.getTotalElements())
                .build();
    }

    @Override
    public MyPageRes.ActivityList loadMyComments(Long userId, int page, int size) {
        Page<CommentEntity> commentPage = commentRepository.findByUserId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return MyPageRes.ActivityList.builder()
                .activities(commentPage.getContent().stream()
                        .map(comment -> MyPageRes.ActivityDto.builder()
                                .id(Long.valueOf(comment.getId()))
                                .title("댓글 내역")
                                .content(comment.getContent())
                                .summary(getSummary(comment.getContent())) 
                                .createdAt(comment.getCreatedAt().format(formatter))
                                .type("comments")
                                .build())
                        .collect(Collectors.toList()))
                .totalPages(commentPage.getTotalPages())
                .totalElements(commentPage.getTotalElements())
                .build();
    }

    private String getSummary(String content) {
        if (content == null) return "";
        return content.length() > 50 ? content.substring(0, 50) + "..." : content;
    }
}
