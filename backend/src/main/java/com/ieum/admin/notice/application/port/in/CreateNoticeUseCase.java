package com.ieum.admin.notice.application.port.in;

import com.ieum.admin.notice.domain.AdminNotice;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import com.ieum.notice.domain.model.NoticeCategory;

/**
 * 관리자 공지사항 등록 유스케이스 (API_ADM_0061)
 */
public interface CreateNoticeUseCase {

    @Builder
    @Getter
    class Command {
        private final String title;
        private final String content;
        private final String summary;
        private final NoticeCategory category;
        private final Boolean isPinned;
        private final Boolean isPopup;
        private final Boolean sendPush;
        private final Boolean isActive;
        private final java.time.LocalDateTime startDate;
        private final java.time.LocalDateTime endDate;
        private final List<MultipartFile> files;
    }

    /**
     * 공지사항 신규 등록 (첨부파일 포함)
     */
    AdminNotice create(Command command);
}
