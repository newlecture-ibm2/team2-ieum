package com.ieum.admin.festival.application.result;

import com.ieum.festival.domain.model.Festival;
import com.ieum.festival.domain.model.FestivalStatus;
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
    private FestivalStatus status;
    private LocalDateTime createdAt;
    
    // For detail UI pre-fill
    private String content;
    private String imgUrl;
    private String extraImages;

    public static CustomFestivalItem from(Festival festival, String resolvedLabel, String categoryLabel) {
        return CustomFestivalItem.builder()
                .festivalId(festival.getId())
                .title(festival.getTitle())
                .areaCode(festival.getAreaCode())
                .areaLabel(resolvedLabel)
                .startDate(festival.getStartDate())
                .endDate(festival.getEndDate())
                .isVisible(festival.isVisible())
                .category(festival.getCategory())
                .categoryLabel(categoryLabel)
                .status(festival.getStatus())
                .createdAt(festival.getCreatedAt())
                .content(festival.getDescription())
                .imgUrl(festival.getImageUrl())
                .extraImages(festival.getExtraImages())
                .build();
    }
}
