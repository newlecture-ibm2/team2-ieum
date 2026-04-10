package com.ieum.admin.festival.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * API_ADM_0030 - 공공 축제 목록 조회 응답 (data 본문)
 *
 * 레벨2 data 객체
 * 페이지네이션 정보 + 상태 요약 + 축제 목록을 포함
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFestivalListResult {

    /** 상태별 축제 개수 요약 정보 */
    private FestivalStatusCountsResult statusCounts;

    /** 수동 동기화 일시 (최근 갱신일) */
    private String lastSyncTime;

    /** 공공 축제 객체 배열 */
    private List<FestivalListItemResult> content;

    /** 현재 페이지 번호 */
    private int page;

    /** 요청한 페이지 크기 */
    private int size;

    /** 전체 검색된 축제 개수 */
    private long totalElements;

    /** 전체 페이지 수 */
    private int totalPages;
}
