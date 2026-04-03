package com.ieum.admin.festival.application.result;

import com.ieum.admin.festival.adapter.out.persistence.entity.AdminFestivalEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class CustomFestivalItem {
    private Long festivalId;
    private String title;
    private String areaCode;
    private String areaLabel;
    private LocalDate startDate;
    private LocalDate endDate;
    @com.fasterxml.jackson.annotation.JsonProperty("isVisible")
    private boolean isVisible;
    private String category;
    private String categoryLabel;
    private String status;
    private LocalDateTime createdAt;
    
    // For detail UI pre-fill
    private String content;
    private String imgUrl;
    private String extraImages;
    
    // New Fields
    private String eventPlace;
    private String address;
    private String useFee;
    private String playTime;
    private String tel;
    private String homepage;
    private String sigunguCode;

    public static CustomFestivalItem from(AdminFestivalEntity festival, String resolvedLabel, String categoryLabel) {
        return CustomFestivalItem.builder()
                .festivalId(festival.getId())
                .title(festival.getTitle())
                .areaCode(festival.getAreaCode())
                .areaLabel(resolvedLabel)
                .startDate(festival.getStartDate())
                .endDate(festival.getEndDate())
                .isVisible(Boolean.TRUE.equals(festival.getIsVisible()))
                .category(festival.getCategory())
                .categoryLabel(categoryLabel)
                .status(festival.getStatus())
                .createdAt(festival.getCreatedAt())
                .content(festival.getDescription())
                .imgUrl(festival.getImageUrl())
                .extraImages(festival.getExtraImages())
                .eventPlace(festival.getEventPlace())
                .address(festival.getAddress())
                .useFee(festival.getUseFee())
                .playTime(festival.getPlayTime())
                .tel(festival.getTel())
                .homepage(festival.getHomepage())
                .sigunguCode(festival.getSigunguCode())
                .build();
    }
}
