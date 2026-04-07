package com.ieum.admin.notice.application.port.in;

import com.ieum.admin.notice.domain.AdminNotice;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 관리자 공지사항 등록 유스케이스 (API_ADM_0061)
 */
public interface CreateNoticeUseCase {

    /**
     * 공지사항 신규 등록 (첨부파일 포함)
     */
    AdminNotice create(String title, String content, String summary,
                  Boolean isPinned, Boolean isPopup, Boolean sendPush,
                  List<MultipartFile> files);
}
