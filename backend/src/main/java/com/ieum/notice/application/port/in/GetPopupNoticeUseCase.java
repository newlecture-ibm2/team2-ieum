package com.ieum.notice.application.port.in;

import com.ieum.notice.domain.model.Notice;

/**
 * 팝업용 공지 조회 유스케이스 (API_NTC_0020)
 * - 메인 화면 진입 시 isPopup=true인 최신 공지 1건 반환
 */
public interface GetPopupNoticeUseCase {

    /**
     * 팝업 공지 조회 (없으면 null)
     */
    Notice getPopupNotice();
}
