package com.ieum.admin.notice.application.port.in;

import com.ieum.admin.notice.domain.AdminNotice;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
 * 관리자 공지사항 수정 유스케이스 (API_ADM_0062)
 */
public interface UpdateNoticeUseCase {

    @Builder
    @Getter
    class Command {
        private final Long noticeId;
        private final String title;
        private final String content;
        private final String summary;
        private final Boolean isPinned;
        private final Boolean isPopup;
        private final Boolean sendPush;
        private final Boolean isActive;
        private final java.time.LocalDateTime startDate;
        private final java.time.LocalDateTime endDate;
        private final List<MultipartFile> newFiles;
        private final List<Long> deleteFileIds;
    }

    /**
     * 공지사항 수정 (첨부파일 추가/삭제 포함)
     */
    AdminNotice update(Command command);
}
