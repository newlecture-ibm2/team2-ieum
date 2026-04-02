package com.ieum.admin.notice.application.port.in;

/**
 * 관리자 공지사항 삭제 유스케이스 (API_ADM_0063)
 */
public interface DeleteNoticeUseCase {

    /**
     * 공지사항 삭제 (첨부파일도 함께 삭제)
     */
    void delete(Long noticeId);
}
