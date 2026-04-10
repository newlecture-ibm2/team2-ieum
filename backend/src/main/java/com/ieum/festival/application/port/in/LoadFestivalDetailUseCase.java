package com.ieum.festival.application.port.in;

import com.ieum.festival.application.result.FestivalDetailResult;

/**
 * 축제 상세 조회 유스케이스 (Port IN)
 */
public interface LoadFestivalDetailUseCase {
    FestivalDetailResult loadDetail(Long festivalId);
}
