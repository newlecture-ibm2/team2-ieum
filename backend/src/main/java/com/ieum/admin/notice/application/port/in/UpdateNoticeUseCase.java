package com.ieum.admin.notice.application.port.in;

import com.ieum.admin.notice.domain.AdminNotice;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 관리자 공지사항 수정 유스케이스 (API_ADM_0062)
 */
public interface UpdateNoticeUseCase {

    /**
     * 공지사항 수정 (첨부파일 추가/삭제 포함)
     */
    AdminNotice update(Long noticeId, String title, String content, String summary,
                  Boolean isPinned, Boolean isPopup,
                  List<MultipartFile> newFiles, List<Long> deleteFileIds);
}
