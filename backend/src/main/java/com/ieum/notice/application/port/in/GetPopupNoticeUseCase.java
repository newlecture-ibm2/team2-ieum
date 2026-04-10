package com.ieum.notice.application.port.in;

import com.ieum.notice.domain.model.Notice;

import java.util.List;

/**
 * 팝업용 공지 조회 유스케이스 (API_NTC_0020)
 * - 메인 화면 진입 시 isPopup=true인 유효한 공지사항 목록 반환
 */
public interface GetPopupNoticeUseCase {

    /**
     * 팝업 공지 목록 조회
     */
    List<Notice> getPopupNotices();
}
