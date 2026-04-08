package com.ieum.festival.adapter.in.web.dto;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class FestivalResponseDto {
    private Long id;
    private String sourceId;
    private String title;
    private String address;
    private String imageUrl;
    private String thumbnailUrl;
    private String overview;
    private String description;
    private String tel;
    private String useFee;
    private String extraImages;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String source;
    private Double latitude;
    private Double longitude;
    private String location;
    private String homepage;
    private String category;
    private String categoryMid;
    private String categorySub;
    private String areaCode;
    private String sigunguCode;
    private String ldongCode;
    private String eventPlace;
    private String playTime;
    private String program;
    private String sponsor;
    private Boolean isCustom;
    private Boolean isVisible;
    private Double avgRating;
    private Integer reviewCount;
    private Integer scrapCount;
    private Integer viewCount;
    private LocalDateTime apiModifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FestivalResponseDto(FestivalEntity entity) {
        this.id = entity.getId();
        this.sourceId = entity.getSourceId();
        this.title = entity.getTitle();
        this.address = entity.getAddress();
        this.imageUrl = entity.getImageUrl();
        this.thumbnailUrl = entity.getThumbnailUrl();
        this.overview = entity.getOverview();
        this.description = entity.getDescription();
        this.tel = entity.getTel();
        this.useFee = entity.getUseFee();
        this.extraImages = entity.getExtraImages();
        this.startDate = entity.getStartDate();
        this.endDate = entity.getEndDate();
        this.source = entity.getSource();
        this.latitude = entity.getLatitude();
        this.longitude = entity.getLongitude();
        this.location = entity.getLocation();
        this.homepage = entity.getHomepage();
        this.category = entity.getCategory();
        this.categoryMid = entity.getCategoryMid();
        this.categorySub = entity.getCategorySub();
        this.areaCode = entity.getAreaCode();
        this.sigunguCode = entity.getSigunguCode();
        this.ldongCode = entity.getLdongCode();
        this.eventPlace = entity.getEventPlace();
        this.playTime = entity.getPlayTime();
        this.program = entity.getProgram();
        this.sponsor = entity.getSponsor();
        this.isCustom = entity.getIsCustom();
        this.isVisible = entity.getIsVisible();
        this.avgRating = entity.getAvgRating();
        this.reviewCount = entity.getReviewCount();
        this.scrapCount = entity.getScrapCount();
        this.viewCount = entity.getViewCount();
        this.apiModifiedAt = entity.getApiModifiedAt();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();

        // 🎯 동적 상태 계산 로직 (엔티티에서 DTO로 분리)
        if (entity.getStartDate() == null || entity.getEndDate() == null) {
            this.status = entity.getStatus();
        } else {
            LocalDate today = LocalDate.now();
            if (today.isBefore(entity.getStartDate())) {
                this.status = "UPCOMING";
            } else if (today.isAfter(entity.getEndDate())) {
                this.status = "ENDED";
            } else {
                this.status = "ONGOING";
            }
        }
    }
}
