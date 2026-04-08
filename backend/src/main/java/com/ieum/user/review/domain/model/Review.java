package com.ieum.user.review.domain.model;

import java.time.LocalDateTime;

/**
 * 리뷰 도메인 모델
 * - JPA 엔티티와 분리된 순수 도메인 객체
 * - 비즈니스 불변조건(invariant)을 보호
 */
public class Review {

    private Long id;
    private Long userId;
    private Long festivalId;
    private Integer rating;
    private String content;
    private String status;
    private String nickname;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Review() {}

    // ── 팩토리 메서드 ──

    /**
     * 새 리뷰 생성
     */
    public static Review create(Long userId, Long festivalId, Integer rating, String content) {
        validateRating(rating);
        validateContent(content);

        Review review = new Review();
        review.userId = userId;
        review.festivalId = festivalId;
        review.rating = rating;
        review.content = content;
        review.status = "ACTIVE";
        return review;
    }

    /**
     * 영속화 계층에서 복원 (재구성)
     */
    public static Review reconstitute(Long id, Long userId, Long festivalId,
                                       Integer rating, String content, String status,
                                       String nickname, String role,
                                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        Review review = new Review();
        review.id = id;
        review.userId = userId;
        review.festivalId = festivalId;
        review.rating = rating;
        review.content = content;
        review.status = status;
        review.nickname = nickname;
        review.role = role;
        review.createdAt = createdAt;
        review.updatedAt = updatedAt;
        return review;
    }

    // ── 비즈니스 메서드 ──

    /**
     * 리뷰 수정 (본인만 가능)
     */
    public void update(Long requestUserId, Integer newRating, String newContent) {
        validateOwnership(requestUserId);
        validateRating(newRating);
        validateContent(newContent);
        this.rating = newRating;
        this.content = newContent;
    }

    /**
     * 리뷰 소프트 삭제 (본인만 가능)
     */
    public void softDelete(Long requestUserId) {
        validateOwnership(requestUserId);
        this.status = "REMOVED";
    }

    public boolean isActive() {
        return "ACTIVE".equals(this.status);
    }

    // ── 검증 로직 ──

    private void validateOwnership(Long requestUserId) {
        if (!this.userId.equals(requestUserId)) {
            throw new IllegalArgumentException("본인의 리뷰만 수정/삭제할 수 있습니다.");
        }
    }

    private static void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("평점은 1~5 사이여야 합니다.");
        }
    }

    private static void validateContent(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("리뷰 내용을 입력해주세요.");
        }
        if (content.length() > 1000) {
            throw new IllegalArgumentException("리뷰 내용은 1000자를 초과할 수 없습니다.");
        }
    }

    // ── Getter ──

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getFestivalId() { return festivalId; }
    public Integer getRating() { return rating; }
    public String getContent() { return content; }
    public String getStatus() { return status; }
    public String getNickname() { return nickname; }
    public String getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
