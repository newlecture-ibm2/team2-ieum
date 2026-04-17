package com.ieum.user.review.application.result;

import com.ieum.user.review.domain.model.Review;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 리뷰 목록 조회 결과 (Application Result)
 * - Map<String, Object> 대신 타입 안전한 결과 객체
 */
@Getter
@AllArgsConstructor
public class ReviewListResult {

    private final List<ReviewItem> content;
    private final int totalPages;
    private final long totalElements;
    private final double averageRating;
    private final Map<Integer, Long> ratingDistribution;

    @Getter
    @AllArgsConstructor
    public static class ReviewItem {
        private final Long id;
        private final Long festivalId;
        private final Long userId;
        private final Integer rating;
        private final String content;
        private final String nickname;
        private final String role;
        private final LocalDateTime createdAt;
        private final LocalDateTime updatedAt;

        public static ReviewItem from(Review review) {
            return new ReviewItem(
                    review.getId(),
                    review.getFestivalId(),
                    review.getUserId(),
                    review.getRating(),
                    review.getContent(),
                    review.getNickname(),
                    review.getRole(),
                    review.getCreatedAt(),
                    review.getUpdatedAt()
            );
        }
    }
}
