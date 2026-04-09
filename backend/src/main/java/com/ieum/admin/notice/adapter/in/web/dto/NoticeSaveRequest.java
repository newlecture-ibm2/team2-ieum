package com.ieum.admin.notice.adapter.in.web.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

/**
 * 관리자 공지사항 작성/수정 요청 DTO (API_ADM_0061, API_ADM_0062)
 * FormData로 전달되는 필드들을 바인딩합니다.
 */
@Getter
@Setter
public class NoticeSaveRequest {
    private String title;
    private String content;
    private String summary;
    private Boolean isPinned;
    private Boolean isPopup;
    private Boolean sendPush;
    private Boolean isActive;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endDate;

    /**
     * Web DTO를 Application의 Create Command 객체로 변환합니다.
     */
    public com.ieum.admin.notice.application.port.in.CreateNoticeUseCase.Command toCreateCommand(
            java.util.List<org.springframework.web.multipart.MultipartFile> files) {
        return com.ieum.admin.notice.application.port.in.CreateNoticeUseCase.Command.builder()
                .title(this.title)
                .content(this.content)
                .summary(this.summary)
                .isPinned(this.isPinned)
                .isPopup(this.isPopup)
                .sendPush(this.sendPush)
                .isActive(this.isActive)
                .startDate(this.startDate)
                .endDate(this.endDate)
                .files(files)
                .build();
    }

    /**
     * Web DTO를 Application의 Update Command 객체로 변환합니다.
     */
    public com.ieum.admin.notice.application.port.in.UpdateNoticeUseCase.Command toUpdateCommand(
            Long noticeId,
            java.util.List<org.springframework.web.multipart.MultipartFile> newFiles,
            java.util.List<Long> deleteFileIds) {
        return com.ieum.admin.notice.application.port.in.UpdateNoticeUseCase.Command.builder()
                .noticeId(noticeId)
                .title(this.title)
                .content(this.content)
                .summary(this.summary)
                .isPinned(this.isPinned)
                .isPopup(this.isPopup)
                .sendPush(this.sendPush)
                .isActive(this.isActive)
                .startDate(this.startDate)
                .endDate(this.endDate)
                .newFiles(newFiles)
                .deleteFileIds(deleteFileIds)
                .build();
    }
}

