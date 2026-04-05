package com.ieum.admin.festival.application.port.in;

import com.ieum.admin.festival.application.result.FestivalSyncResult;

/**
 * 공공 API 축제 데이터 동기화 유스케이스 (API_ADM_0031)
 */
public interface SyncFestivalUseCase {

    FestivalSyncResult syncFestivalsFromTourApi();
}
