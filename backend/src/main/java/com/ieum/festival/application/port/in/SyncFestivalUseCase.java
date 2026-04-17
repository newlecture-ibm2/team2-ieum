package com.ieum.festival.application.port.in;

/**
 * 축제 공공데이터 동기화 유스케이스 (Port IN)
 */
public interface SyncFestivalUseCase {
    void syncFestivals(String eventStartDate);
}
