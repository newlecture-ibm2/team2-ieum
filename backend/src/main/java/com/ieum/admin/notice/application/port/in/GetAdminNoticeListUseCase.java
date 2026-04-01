package com.ieum.admin.notice.application.port.in;

import com.ieum.notice.domain.model.Notice;
import org.springframework.data.domain.Page;

/**
 * 관리자용 공지사항 목록 조회 유스케이스 (API_ADM_0060)
 */
public interface GetAdminNoticeListUseCase {

    /**
     * 관리자용 공지 목록 (전체 포함, 숨김/팝업 상태 모두 표시)
     */
    Page<Notice> getAdminNotices(int page, int size);
}
