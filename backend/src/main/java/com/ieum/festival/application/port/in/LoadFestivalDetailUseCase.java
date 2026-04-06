package com.ieum.festival.application.port.in;

import java.util.Map;

/**
 * 축제 상세 조회 유스케이스 (Port IN)
 * - Lazy Caching 로직 포함 (공공 API → DB 캐싱)
 */
public interface LoadFestivalDetailUseCase {

    /**
     * 축제 ID로 상세 정보 조회
     * 
     * @return 축제 상세 데이터 Map (없으면 null)
     */
    Map<String, Object> loadDetail(Long festivalId);
}
