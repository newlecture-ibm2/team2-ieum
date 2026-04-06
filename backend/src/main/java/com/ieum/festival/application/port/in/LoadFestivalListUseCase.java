package com.ieum.festival.application.port.in;

import java.util.Map;

/**
 * 축제 목록 조회 유스케이스 (Port IN)
 */
public interface LoadFestivalListUseCase {

    /**
     * 상태/키워드/지역/월 필터 기반 축제 목록 페이징 조회
     *
     * @return { list, total, totalPages, currentPage }
     */
    Map<String, Object> loadFestivals(String status, String keyword, String areaCode,
                                       Integer month, int page, int size);
}
