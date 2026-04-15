package com.ieum.notice.application.port.in;

import com.ieum.notice.domain.model.Notice;
import org.springframework.data.domain.Page;

/**
 * 공지사항 목록 조회 유스케이스 (API_NTC_0010)
 */
public interface GetNoticeListUseCase {

    /**
     * 공지사항 목록 조회 (검색, 페이징, 카테고리 필터 포함)
     * - 정렬 기준 등은 서비스 내부에서 결정
     */
    Page<Notice> getNotices(String searchType, String keyword, String category, int page, int size);
}
