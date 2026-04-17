package com.ieum.festival.application.result;

import com.ieum.festival.domain.model.Festival;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

/**
 * 축제 상세 조회 결과 (Application Result)
 */
@Getter
@AllArgsConstructor
public class FestivalDetailResult {

    private final Long id;
    private final String sourceId;
    private final String title;
    private final String address;
    private final String imageUrl;
    private final String thumbnailUrl;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String status;
    private final String overview;
    private final String tel;
    private final String fee;
    private final List<String> images;

    public static FestivalDetailResult from(Festival festival) {
        return new FestivalDetailResult(
                festival.getId(),
                festival.getSourceId(),
                festival.getTitle(),
                festival.getAddress(),
                festival.getImageUrl(),
                festival.getThumbnailUrl(),
                festival.getStartDate(),
                festival.getEndDate(),
                festival.calculateStatus(),
                festival.getOverview(),
                festival.getTel(),
                festival.getUseFee(),
                festival.getExtraImages()
        );
    }
}
