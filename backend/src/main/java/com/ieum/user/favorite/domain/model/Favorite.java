package com.ieum.user.favorite.domain.model;

import java.time.LocalDateTime;

/**
 * 즐겨찾기(찜) 도메인 모델
 * - JPA 엔티티와 분리된 순수 도메인 객체
 */
public class Favorite {

    private Long id;
    private Long userId;
    private Long festivalId;
    private LocalDateTime createdAt;

    // 축제 정보 (목록 조회 시 JOIN 결과)
    private String festivalTitle;
    private String festivalAddress;
    private String festivalImageUrl;
    private String festivalStartDate;
    private String festivalEndDate;
    private String festivalStatus;

    private Favorite() {}

    // ── 팩토리 메서드 ──

    /**
     * 새 즐겨찾기 생성
     */
    public static Favorite create(Long userId, Long festivalId) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요한 서비스입니다.");
        }
        if (festivalId == null) {
            throw new IllegalArgumentException("축제 ID가 필요합니다.");
        }

        Favorite favorite = new Favorite();
        favorite.userId = userId;
        favorite.festivalId = festivalId;
        return favorite;
    }

    /**
     * 영속화 계층에서 복원 (단순 찜 정보만)
     */
    public static Favorite reconstitute(Long id, Long userId, Long festivalId,
                                         LocalDateTime createdAt) {
        Favorite favorite = new Favorite();
        favorite.id = id;
        favorite.userId = userId;
        favorite.festivalId = festivalId;
        favorite.createdAt = createdAt;
        return favorite;
    }

    /**
     * 영속화 계층에서 복원 (축제 정보 포함 — 목록 조회용)
     */
    public static Favorite reconstituteWithFestival(Long id, Long userId, Long festivalId,
                                                     LocalDateTime createdAt,
                                                     String festivalTitle, String festivalAddress,
                                                     String festivalImageUrl,
                                                     String festivalStartDate, String festivalEndDate,
                                                     String festivalStatus) {
        Favorite favorite = new Favorite();
        favorite.id = id;
        favorite.userId = userId;
        favorite.festivalId = festivalId;
        favorite.createdAt = createdAt;
        favorite.festivalTitle = festivalTitle;
        favorite.festivalAddress = festivalAddress;
        favorite.festivalImageUrl = festivalImageUrl;
        favorite.festivalStartDate = festivalStartDate;
        favorite.festivalEndDate = festivalEndDate;
        favorite.festivalStatus = festivalStatus;
        return favorite;
    }

    // ── Getter ──

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getFestivalId() { return festivalId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getFestivalTitle() { return festivalTitle; }
    public String getFestivalAddress() { return festivalAddress; }
    public String getFestivalImageUrl() { return festivalImageUrl; }
    public String getFestivalStartDate() { return festivalStartDate; }
    public String getFestivalEndDate() { return festivalEndDate; }
    public String getFestivalStatus() { return festivalStatus; }
}
