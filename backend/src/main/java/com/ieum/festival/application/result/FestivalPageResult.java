package com.ieum.festival.application.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 축제 목록 페이징 결과 (Application Result)
 */
@Getter
@AllArgsConstructor
public class FestivalPageResult {
    private final List<FestivalListItemResult> list;
    private final long total;
    private final int totalPages;
    private final int currentPage;
}
