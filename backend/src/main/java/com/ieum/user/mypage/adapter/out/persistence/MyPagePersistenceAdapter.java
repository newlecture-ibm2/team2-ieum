package com.ieum.user.mypage.adapter.out.persistence;

import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageRes;
import com.ieum.user.mypage.application.port.out.LoadMyActivityPort;
import com.ieum.user.mypage.adapter.out.persistence.repository.MyPageCommentRepository;
import com.ieum.user.mypage.adapter.out.persistence.repository.MyPagePostRepository;
import com.ieum.user.mypage.adapter.out.persistence.repository.MyPageReviewRepository;
import com.ieum.user.inquiry.adapter.out.persistence.entity.UserInquiryEntity;
import com.ieum.user.inquiry.adapter.out.persistence.repository.UserInquiryRepository;
import com.ieum.user.report.adapter.out.persistence.entity.UserReportEntity;
import com.ieum.user.report.adapter.out.persistence.repository.ReportRepository;
import com.ieum.user.review.adapter.out.persistence.entity.ReviewEntity;
import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;
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
    private final FestivalJpaRepository festivalRepository;
    private final UserInquiryRepository inquiryRepository;
    private final ReportRepository reportRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public MyPageRes.ActivityList loadMyPosts(Long userId, int page, int size) {
        Page<PostEntity> postPage = postRepository.findByAuthorIdAndStatus(userId, "ACTIVE", PageRequest.of(page, size, Sort.by("createdAt").descending()));
        
        return MyPageRes.ActivityList.builder()
                .activities(postPage.getContent().stream()
                        .map(post -> MyPageRes.ActivityDto.builder()
                                .id(post.getId())
                                .title(post.getTitle())
                                .content(post.getContent())
                                .summary(getSummary(post.getContent())) 
                                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().format(formatter) : "")
                                .type("posts")
                                .build())
                        .collect(Collectors.toList()))
                .totalPages(postPage.getTotalPages())
                .totalElements(postPage.getTotalElements())
                .build();
    }

    @Override
    public MyPageRes.ActivityList loadMyReviews(Long userId, int page, int size) {
        Page<ReviewEntity> reviewPage = reviewRepository.findByUserIdAndStatus(userId, "ACTIVE", PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return MyPageRes.ActivityList.builder()
                .activities(reviewPage.getContent().stream()
                        .map(review -> {
                            FestivalEntity festival = festivalRepository.findById(review.getFestivalId()).orElse(null);
                            return MyPageRes.ActivityDto.builder()
                                .id(review.getId())
                                .title("리뷰 내역")
                                .content(review.getContent())
                                .summary(getSummary(review.getContent()))
                                .createdAt(review.getCreatedAt() != null ? review.getCreatedAt().format(formatter) : "")
                                .type("reviews")
                                .festivalName(festival != null ? festival.getTitle() : "알 수 없는 축제")
                                .rating(review.getRating())
                                .location(festival != null ? festival.getLocation() : "")
                                .festivalId(review.getFestivalId())
                                .build();
                        })
                        .collect(Collectors.toList()))
                .totalPages(reviewPage.getTotalPages())
                .totalElements(reviewPage.getTotalElements())
                .build();
    }

    @Override
    public MyPageRes.ActivityList loadMyComments(Long userId, int page, int size) {
        Page<CommentEntity> commentPage = commentRepository.findByUserIdAndStatus(userId, "ACTIVE", PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return MyPageRes.ActivityList.builder()
                .activities(commentPage.getContent().stream()
                        .map(comment -> {
                            PostEntity post = postRepository.findById(comment.getPostId()).orElse(null);
                            return MyPageRes.ActivityDto.builder()
                                .id(comment.getId())
                                .title("댓글 내역")
                                .content(comment.getContent())
                                .summary(getSummary(comment.getContent()))
                                .createdAt(comment.getCreatedAt() != null ? comment.getCreatedAt().format(formatter) : "")
                                .type("comments")
                                .postId(comment.getPostId())
                                .postTitle(post != null ? post.getTitle() : "알 수 없는 게시글")
                                .build();
                        })
                        .collect(Collectors.toList()))
                .totalPages(commentPage.getTotalPages())
                .totalElements(commentPage.getTotalElements())
                .build();
    }

    @Override
    public MyPageRes.ActivityList loadMyInquiries(Long userId, int page, int size) {
        Page<UserInquiryEntity> inquiryPage = inquiryRepository.findAllByUserId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return MyPageRes.ActivityList.builder()
                .activities(inquiryPage.getContent().stream()
                        .map(inquiry -> MyPageRes.ActivityDto.builder()
                                .id(inquiry.getId())
                                .title(inquiry.getTitle())
                                .content(inquiry.getContent())
                                .summary(getSummary(inquiry.getContent()))
                                .createdAt(inquiry.getCreatedAt() != null ? inquiry.getCreatedAt().format(formatter) : "")
                                .type("inquiries")
                                .status(inquiry.getStatus())
                                .answer(inquiry.getAnswer())
                                .answeredAt(inquiry.getAnsweredAt() != null ? inquiry.getAnsweredAt().format(formatter) : "")
                                .build())
                        .collect(Collectors.toList()))
                .totalPages(inquiryPage.getTotalPages())
                .totalElements(inquiryPage.getTotalElements())
                .build();
    }

    @Override
    public MyPageRes.ActivityList loadMyReports(Long userId, int page, int size) {
        Page<UserReportEntity> reportPage = reportRepository.findAllByReporterId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return MyPageRes.ActivityList.builder()
                .activities(reportPage.getContent().stream()
                        .map(report -> MyPageRes.ActivityDto.builder()
                                .id(report.getId())
                                .title(report.getTargetType() + " - " + report.getReason())
                                .content(report.getDescription())
                                .summary(getSummary(report.getDescription()))
                                .createdAt(report.getCreatedAt() != null ? report.getCreatedAt().format(formatter) : "")
                                .type("reports")
                                .status(report.getStatus())
                                .answer(report.getAdminNote())
                                .targetId(report.getTargetId())
                                .build())
                        .collect(Collectors.toList()))
                .totalPages(reportPage.getTotalPages())
                .totalElements(reportPage.getTotalElements())
                .build();
    }

    private String getSummary(String content) {
        if (content == null) return "";
        // 1. HTML 태그 제거
        String cleanText = content.replaceAll("<[^>]*>", "");
        // 2. HTML 엔티티 치환 (&nbsp; 등)
        cleanText = cleanText.replaceAll("&nbsp;", " ");
        cleanText = cleanText.replaceAll("&lt;", "<");
        cleanText = cleanText.replaceAll("&gt;", ">");
        cleanText = cleanText.replaceAll("&amp;", "&");
        
        return cleanText.length() > 50 ? cleanText.substring(0, 50) + "..." : cleanText;
    }
}
