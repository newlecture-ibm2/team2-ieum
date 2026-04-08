package com.ieum.festival.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 축제 도메인 모델
 * - JPA 엔티티와 분리된 순수 도메인 객체
 * - 비즈니스 로직(상태 계산, 통계 업데이트 등)을 캡슐화
 */
public class Festival {

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
    private List<String> extraImages;
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
    private Integer favoriteCount;
    private Integer viewCount;
    private LocalDateTime apiModifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Festival() {}

    public static Festival reconstitute(
            Long id, String sourceId, String title, String address,
            String imageUrl, String thumbnailUrl, String overview, String description,
            String tel, String useFee, List<String> extraImages,
            LocalDate startDate, LocalDate endDate, String status, String source,
            Double latitude, Double longitude, String location, String homepage,
            String category, String categoryMid, String categorySub,
            String areaCode, String sigunguCode, String ldongCode,
            String eventPlace, String playTime, String program, String sponsor,
            Boolean isCustom, Boolean isVisible,
            Double avgRating, Integer reviewCount, Integer favoriteCount, Integer viewCount,
            LocalDateTime apiModifiedAt, LocalDateTime createdAt, LocalDateTime updatedAt
    ) {
        Festival f = new Festival();
        f.id = id;
        f.sourceId = sourceId;
        f.title = title;
        f.address = address;
        f.imageUrl = imageUrl;
        f.thumbnailUrl = thumbnailUrl;
        f.overview = overview;
        f.description = description;
        f.tel = tel;
        f.useFee = useFee;
        f.extraImages = extraImages != null ? new ArrayList<>(extraImages) : new ArrayList<>();
        f.startDate = startDate;
        f.endDate = endDate;
        f.status = status;
        f.source = source;
        f.latitude = latitude;
        f.longitude = longitude;
        f.location = location;
        f.homepage = homepage;
        f.category = category;
        f.categoryMid = categoryMid;
        f.categorySub = categorySub;
        f.areaCode = areaCode;
        f.sigunguCode = sigunguCode;
        f.ldongCode = ldongCode;
        f.eventPlace = eventPlace;
        f.playTime = playTime;
        f.program = program;
        f.sponsor = sponsor;
        f.isCustom = isCustom;
        f.isVisible = isVisible;
        f.avgRating = avgRating;
        f.reviewCount = reviewCount;
        f.favoriteCount = favoriteCount;
        f.viewCount = viewCount;
        f.apiModifiedAt = apiModifiedAt;
        f.createdAt = createdAt;
        f.updatedAt = updatedAt;
        return f;
    }

    public String calculateStatus() {
        if (startDate == null || endDate == null) {
            return status;
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(startDate)) {
            return "UPCOMING";
        } else if (today.isAfter(endDate)) {
            return "ENDED";
        } else {
            return "ONGOING";
        }
    }

    public void enrichWithApiDetail(String overview, String tel, String useFee, List<String> images) {
        this.overview = overview;
        this.tel = tel;
        this.useFee = useFee;
        if (images != null && !images.isEmpty()) {
            this.extraImages = new ArrayList<>(images);
        }
    }

    public boolean needsApiDetailEnrichment() {
        return "API".equals(this.source) && this.overview == null;
    }

    public String getExtraImagesAsString() {
        if (extraImages == null || extraImages.isEmpty()) return null;
        return String.join(",", extraImages);
    }

    public static List<String> parseExtraImages(String commaSeparated) {
        if (commaSeparated == null || commaSeparated.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(commaSeparated.split(",")));
    }

    public Long getId() { return id; }
    public String getSourceId() { return sourceId; }
    public String getTitle() { return title; }
    public String getAddress() { return address; }
    public String getImageUrl() { return imageUrl; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getOverview() { return overview; }
    public String getDescription() { return description; }
    public String getTel() { return tel; }
    public String getUseFee() { return useFee; }
    public List<String> getExtraImages() { return extraImages != null ? Collections.unmodifiableList(extraImages) : Collections.emptyList(); }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getStatus() { return status; }
    public String getSource() { return source; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getLocation() { return location; }
    public String getHomepage() { return homepage; }
    public String getCategory() { return category; }
    public String getCategoryMid() { return categoryMid; }
    public String getCategorySub() { return categorySub; }
    public String getAreaCode() { return areaCode; }
    public String getSigunguCode() { return sigunguCode; }
    public String getLdongCode() { return ldongCode; }
    public String getEventPlace() { return eventPlace; }
    public String getPlayTime() { return playTime; }
    public String getProgram() { return program; }
    public String getSponsor() { return sponsor; }
    public Boolean getIsCustom() { return isCustom; }
    public Boolean getIsVisible() { return isVisible; }
    public Double getAvgRating() { return avgRating; }
    public Integer getReviewCount() { return reviewCount; }
    public Integer getFavoriteCount() { return favoriteCount; }
    public Integer getViewCount() { return viewCount; }
    public LocalDateTime getApiModifiedAt() { return apiModifiedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
