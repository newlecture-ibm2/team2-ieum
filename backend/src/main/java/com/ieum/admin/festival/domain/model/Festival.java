package com.ieum.admin.festival.domain.model;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 축제 도메인 모델 (순수 자바 객체)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Festival {

    private Long id;
    private String sourceId;
    
    @Builder.Default
    private FestivalSource source = FestivalSource.MANUAL;
    
    private String title;
    private String description;
    private String overview;
    private String location;
    private String address;
    private LocalDate startDate;
    private LocalDate endDate;
    
    @Builder.Default
    private FestivalStatus status = FestivalStatus.UPCOMING;
    
    private String imageUrl;
    private String thumbnailUrl;
    private String extraImages;
    private String homepage;
    private String tel;
    private Double latitude;
    private Double longitude;
    private String category;
    private String categoryMid;
    private String categorySub;
    private String areaCode;
    private String sigunguCode;
    private String ldongCode;
    private String eventPlace;
    private String playTime;
    private String program;
    private String useFee;
    private String sponsor;
    
    @Builder.Default
    private boolean isCustom = false;
    
    @Builder.Default
    private boolean isVisible = true;
    
    @Builder.Default
    private Double avgRating = 0.0;
    
    @Builder.Default
    private Integer reviewCount = 0;
    
    @Builder.Default
    private Integer favoriteCount = 0;
    
    @Builder.Default
    private Integer viewCount = 0;
    
    private LocalDateTime apiModifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 시작일/종료일 기준으로 축제 상태를 계산하는 도메인 비즈니스 로직
     */
    public static FestivalStatus calculateStatus(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null) return FestivalStatus.UPCOMING;
        java.time.LocalDate now = java.time.LocalDate.now();
        if (now.isBefore(startDate)) {
            return FestivalStatus.UPCOMING;
        } else if (now.isAfter(endDate)) {
            return FestivalStatus.ENDED;
        } else {
            return FestivalStatus.ONGOING;
        }
    }
}
