package com.ieum.admin.festival.application.result;

import com.ieum.admin.festival.domain.model.Festival;
import com.ieum.admin.festival.domain.model.FestivalStatus;
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

    /**
     * 도메인 모델 → Result DTO 변환
     * (기존 Entity 의존 제거 → Domain 기반으로 전환)
     */
    public static CustomFestivalItem from(Festival festival, String resolvedLabel, String specificCategory, String categoryLabel) {
        return CustomFestivalItem.builder()
                .festivalId(festival.getId())
                .title(festival.getTitle())
                .areaCode(festival.getAreaCode())
                .areaLabel(resolvedLabel)
                .startDate(festival.getStartDate())
                .endDate(festival.getEndDate())
                .isVisible(festival.isVisible())
                .category(specificCategory)
                .categoryLabel(categoryLabel)
                .status(festival.getStatus() != null ? festival.getStatus().name() : FestivalStatus.UPCOMING.name())
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
