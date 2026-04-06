package com.ieum.admin.festival.application.port.in;

/**
 * 마스터 데이터(지역/카테고리/시군구) 동기화 유스케이스
 * - 공공 API(Tour API)로부터 코드 목록을 조회하여 DB와 동기화
 * - festival sync 실행 전 선행 호출됨
 */
public interface SyncMasterDataUseCase {

    /** 지역 + 카테고리 + 시군구 전체 동기화 */
    MasterSyncSummary syncAll();

    /** 지역(시/도) 코드 동기화 */
    int syncRegions();

    /** 카테고리 코드 동기화 */
    int syncCategories();

    /** 시군구 코드 동기화 (전 지역 대상) */
    int syncSigungus();

    /** 동기화 결과 요약 */
    record MasterSyncSummary(int regionCount, int categoryCount, int sigunguCount) {}
}
