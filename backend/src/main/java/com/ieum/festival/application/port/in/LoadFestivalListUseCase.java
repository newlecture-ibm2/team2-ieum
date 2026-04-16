package com.ieum.festival.application.port.in;

import com.ieum.festival.application.result.FestivalPageResult;

import java.util.List;

/**
 * 축제 목록 조회 유스케이스 (Port IN)
 */
public interface LoadFestivalListUseCase {
    FestivalPageResult loadFestivals(String status, String keyword, List<String> areaCodes, List<Integer> months, String sort, Double lat, Double lng, int page, int size);
}
