package com.ieum.notice.adapter.in.web.dto;

import com.ieum.notice.domain.model.Notice;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 공지사항 상세 조회 응답 DTO (API_NTC_0011)
 * - 현재 공지 + 이전글/다음글 정보 포함
 */
@Getter
@AllArgsConstructor
public class NoticeDetailResponse {

    /** 현재 공지사항 */
    private Notice notice;

    /** 이전 공지사항 (없으면 null) */
    private Notice prevNotice;

    /** 다음 공지사항 (없으면 null) */
    private Notice nextNotice;
}
