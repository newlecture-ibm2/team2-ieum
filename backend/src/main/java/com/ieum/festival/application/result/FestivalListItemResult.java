package com.ieum.festival.application.result;

import com.ieum.festival.domain.model.Festival;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 축제 목록 항목 결과 DTO (Application Result)
 */
@Getter
@AllArgsConstructor
public class FestivalListItemResult {

    private final Long id;
    private final String sourceId;
    private final String title;
    private final String address;
    private final String imageUrl;
    private final String thumbnailUrl;
    private final String overview;
    private final String description;
    private final String tel;
    private final String useFee;
    private final String extraImages;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String status;
    private final String source;
    private final Double latitude;
    private final Double longitude;
    private final String location;
    private final String homepage;
    private final String category;
    private final String categoryMid;
    private final String categorySub;
    private final String areaCode;
    private final String sigunguCode;
    private final String ldongCode;
    private final String eventPlace;
    private final String playTime;
    private final String program;
    private final String sponsor;
    private final Boolean isCustom;
    private final Boolean isVisible;
    private final Double avgRating;
    private final Integer reviewCount;
    private final Integer favoriteCount;
    private final Integer viewCount;
    private final LocalDateTime apiModifiedAt;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static FestivalListItemResult from(Festival f) {
        return new FestivalListItemResult(
                f.getId(), f.getSourceId(), f.getTitle(), f.getAddress(),
                f.getImageUrl(), f.getThumbnailUrl(), f.getOverview(), f.getDescription(),
                f.getTel(), f.getUseFee(), f.getExtraImagesAsString(),
                f.getStartDate(), f.getEndDate(), f.calculateStatus(), f.getSource(),
                f.getLatitude(), f.getLongitude(), f.getLocation(), f.getHomepage(),
                f.getCategory(), f.getCategoryMid(), f.getCategorySub(),
                f.getAreaCode(), f.getSigunguCode(), f.getLdongCode(),
                f.getEventPlace(), f.getPlayTime(), f.getProgram(), f.getSponsor(),
                f.getIsCustom(), f.getIsVisible(),
                f.getAvgRating(), f.getReviewCount(), f.getFavoriteCount(), f.getViewCount(),
                f.getApiModifiedAt(), f.getCreatedAt(), f.getUpdatedAt()
        );
    }
}
