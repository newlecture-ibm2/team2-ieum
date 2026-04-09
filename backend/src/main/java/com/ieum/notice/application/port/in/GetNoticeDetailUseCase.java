package com.ieum.notice.application.port.in;

import com.ieum.notice.adapter.in.web.dto.NoticeDetailResponse;

/**
 * 공지사항 상세 조회 유스케이스 (API_NTC_0011)
 * - 이전글/다음글 정보 포함
 */
public interface GetNoticeDetailUseCase {

    /**
     * 공지사항 상세 조회 (조회수 증가 + 이전글/다음글)
     * @return notice 정보 + prevNotice + nextNotice
     */
    NoticeDetailResponse getNoticeDetail(Long noticeId);
}

