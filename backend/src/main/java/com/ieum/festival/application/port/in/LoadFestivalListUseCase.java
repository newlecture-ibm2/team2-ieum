package com.ieum.festival.application.port.in;

import com.ieum.festival.application.result.FestivalPageResult;

import java.util.List;

/**
 * 축제 목록 조회 유스케이스 (Port IN)
 */
public interface LoadFestivalListUseCase {
<<<<<<< HEAD

    /**
     * 상태/키워드/지역/월 필터 기반 축제 목록 페이징 조회
     *
     * @return { list, total, totalPages, currentPage }
     */
    Map<String, Object> loadFestivals(String status, String keyword, String areaCode,
                                       Integer month, String sort, Double lat, Double lng,
                                       int page, int size);
=======
    FestivalPageResult loadFestivals(String status, String keyword, List<String> areaCodes, List<Integer> months, String sort, Double lat, Double lng, int page, int size);
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
}
