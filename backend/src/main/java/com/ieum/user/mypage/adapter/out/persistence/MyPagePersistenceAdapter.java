package com.ieum.user.mypage.adapter.out.persistence;

import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import com.ieum.user.mypage.application.port.out.LoadMyActivityPort;
import com.ieum.user.mypage.application.result.ActivityItemResult;
import com.ieum.user.mypage.application.result.ActivityPageResult;
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
import com.ieum.user.report.domain.model.Report;
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
    public ActivityPageResult loadMyPosts(Long userId, int page, int size) {
        Page<PostEntity> postPage = postRepository.findByAuthorIdAndStatus(userId, "ACTIVE", PageRequest.of(page, size, Sort.by("createdAt").descending()));
        
        List<ActivityItemResult> items = postPage.getContent().stream()
                .map(post -> ActivityItemResult.builder()
                        .id(post.getId())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .summary(getSummary(post.getContent())) 
                        .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().format(formatter) : "")
                        .type("posts")
                        .build())
                .collect(Collectors.toList());

        return new ActivityPageResult(items, postPage.getTotalElements(), postPage.getTotalPages(), page);
    }

    @Override
    public ActivityPageResult loadMyReviews(Long userId, int page, int size) {
        Page<ReviewEntity> reviewPage = reviewRepository.findByUserIdAndStatus(userId, "ACTIVE", PageRequest.of(page, size, Sort.by("createdAt").descending()));

        List<ActivityItemResult> items = reviewPage.getContent().stream()
                .map(review -> {
                    FestivalEntity festival = festivalRepository.findById(review.getFestivalId()).orElse(null);
                    return ActivityItemResult.builder()
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
                .collect(Collectors.toList());

        return new ActivityPageResult(items, reviewPage.getTotalElements(), reviewPage.getTotalPages(), page);
    }

    @Override
    public ActivityPageResult loadMyComments(Long userId, int page, int size) {
        Page<CommentEntity> commentPage = commentRepository.findByUserIdAndStatusWithActivePost(userId, "ACTIVE", PageRequest.of(page, size, Sort.by("createdAt").descending()));

        List<ActivityItemResult> items = commentPage.getContent().stream()
                .map(comment -> {
                    PostEntity post = postRepository.findById(comment.getPostId()).orElse(null);
                    return ActivityItemResult.builder()
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
                .collect(Collectors.toList());

        return new ActivityPageResult(items, commentPage.getTotalElements(), commentPage.getTotalPages(), page);
    }

    @Override
    public ActivityPageResult loadMyInquiries(Long userId, int page, int size) {
        Page<UserInquiryEntity> inquiryPage = inquiryRepository.findAllByUserId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        List<ActivityItemResult> items = inquiryPage.getContent().stream()
                .map(inquiry -> ActivityItemResult.builder()
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
                .collect(Collectors.toList());

        return new ActivityPageResult(items, inquiryPage.getTotalElements(), inquiryPage.getTotalPages(), page);
    }

    @Override
    public ActivityPageResult loadMyReports(Long userId, int page, int size) {
        Page<UserReportEntity> reportPage = reportRepository.findAllByReporterId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        List<ActivityItemResult> items = reportPage.getContent().stream()
                .map(report -> {
                    String targetType = report.getTargetType();
                    Long targetParentId = null;
                    String targetContent = null;

                    if (Report.TARGET_COMMENT.equalsIgnoreCase(targetType)) {
                        targetParentId = commentRepository.findById(report.getTargetId())
                                .map(CommentEntity::getPostId)
                                .orElse(null);
                        targetContent = commentRepository.findById(report.getTargetId())
                                .map(CommentEntity::getContent)
                                .orElse(null);
                    } else if (Report.TARGET_REVIEW.equalsIgnoreCase(targetType)) {
                        targetParentId = reviewRepository.findById(report.getTargetId())
                                .map(ReviewEntity::getFestivalId)
                                .orElse(null);
                        targetContent = reviewRepository.findById(report.getTargetId())
                                .map(ReviewEntity::getContent)
                                .orElse(null);
                    } else if (Report.TARGET_POST.equalsIgnoreCase(targetType)) {
                        targetContent = postRepository.findById(report.getTargetId())
                                .map(PostEntity::getContent)
                                .orElse(null);
                    }

                    return ActivityItemResult.builder()
                        .id(report.getId())
                        .title(report.getTargetType() + " - " + report.getReason())
                        .content(report.getDescription())
                        .summary(getSummary(report.getDescription()))
                        .createdAt(report.getCreatedAt() != null ? report.getCreatedAt().format(formatter) : "")
                        .type("reports")
                        .status(report.getStatus())
                        .answer(report.getAdminNote())
                        .targetType(targetType)
                        .targetId(report.getTargetId())
                        .targetParentId(targetParentId)
                        .reason(report.getReason())
                        .targetContent(targetContent)
                        .build();
                })
                .collect(Collectors.toList());

        return new ActivityPageResult(items, reportPage.getTotalElements(), reportPage.getTotalPages(), page);
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
