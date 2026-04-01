package com.ieum.notice.application.port.in;

import com.ieum.notice.domain.model.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 공지사항 목록 조회 유스케이스 (API_NTC_0010)
 */
public interface GetNoticeListUseCase {

    /**
     * 공지사항 목록 조회 (검색, 페이징 포함)
     */
    Page<Notice> getNotices(String searchType, String keyword, Pageable pageable);
}
