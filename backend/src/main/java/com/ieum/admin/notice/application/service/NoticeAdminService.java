package com.ieum.admin.notice.application.service;

import com.ieum.admin.notice.application.port.in.CreateNoticeUseCase;
import com.ieum.admin.notice.application.port.in.DeleteNoticeUseCase;
import com.ieum.admin.notice.application.port.in.GetAdminNoticeListUseCase;
import com.ieum.admin.notice.application.port.in.UpdateNoticeUseCase;
import com.ieum.admin.notice.application.port.out.AdminNoticePort;
import com.ieum.admin.notice.domain.AdminNotice;
import com.ieum.attachment.application.port.in.DeleteAttachmentUseCase;
import com.ieum.attachment.application.port.in.UploadAttachmentUseCase;
import com.ieum.global.common.enums.TargetType;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import com.ieum.notice.domain.model.NoticeCategory;
import com.ieum.user.notification.application.port.in.SystemNotificationUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 관리자용 공지사항 서비스 (UseCase 구현체)
 * - attachment 공통 모듈의 UseCase를 주입받아 파일 처리
 * - 자체 AdminNoticePort를 주입받아 DB 접근 (사용자 모듈과 완전 독립)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class NoticeAdminService
        implements CreateNoticeUseCase, UpdateNoticeUseCase, DeleteNoticeUseCase, GetAdminNoticeListUseCase {

    private final AdminNoticePort adminNoticePort;
    private final UploadAttachmentUseCase uploadAttachmentUseCase;
    private final DeleteAttachmentUseCase deleteAttachmentUseCase;
    private final SystemNotificationUseCase systemNotificationUseCase;

    @Override
    public AdminNotice create(CreateNoticeUseCase.Command command) {

        AdminNotice notice = AdminNotice.builder()
                .title(command.getTitle())
                .content(command.getContent())
                .summary(command.getSummary())
                .category(command.getCategory() != null ? command.getCategory() : NoticeCategory.GENERAL)
                .isPinned(command.getIsPinned() != null ? command.getIsPinned() : false)
                .isPopup(command.getIsPopup() != null ? command.getIsPopup() : false)
                .isPushed(Boolean.TRUE.equals(command.getSendPush()))
                .isActive(command.getIsActive() != null ? command.getIsActive() : true)
                .startDate(command.getStartDate())
                .endDate(command.getEndDate())
                .build();

        AdminNotice saved = adminNoticePort.save(notice);

        // 첨부파일 업로드 (attachment 공통 모듈 사용)
        if (command.getFiles() != null && !command.getFiles().isEmpty()) {
            uploadAttachmentUseCase.uploadAll(TargetType.NOTICE.name(), saved.getId(), command.getFiles());
        }

        // 푸시 알림 발송
        if (Boolean.TRUE.equals(command.getSendPush())) {
            systemNotificationUseCase.sendNoticeNotification(saved.getId(), saved.getTitle(), saved.getSummary());
        }

        return saved;
    }

    @Override
    public AdminNotice update(UpdateNoticeUseCase.Command command) {

        AdminNotice notice = adminNoticePort.findById(command.getNoticeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_001, "noticeId=" + command.getNoticeId()));

        AdminNotice updated = AdminNotice.builder()
                .id(notice.getId())
                .title(command.getTitle())
                .content(command.getContent())
                .summary(command.getSummary())
                .category(command.getCategory() != null ? command.getCategory() : notice.getCategory())
                .viewCount(notice.getViewCount())
                .isPinned(command.getIsPinned() != null ? command.getIsPinned() : notice.getIsPinned())
                .isPopup(command.getIsPopup() != null ? command.getIsPopup() : notice.getIsPopup())
                .isPushed(Boolean.TRUE.equals(command.getSendPush()) || notice.getIsPushed())
                .isActive(command.getIsActive() != null ? command.getIsActive() : notice.getIsActive())
                .startDate(command.getStartDate() != null ? command.getStartDate() : notice.getStartDate())
                .endDate(command.getEndDate() != null ? command.getEndDate() : notice.getEndDate())
                .createdAt(notice.getCreatedAt())
                .build();

        // 삭제할 기존 파일 처리
        if (command.getDeleteFileIds() != null && !command.getDeleteFileIds().isEmpty()) {
            command.getDeleteFileIds().forEach(deleteAttachmentUseCase::delete);
        }

        // 새 파일 업로드
        if (command.getNewFiles() != null && !command.getNewFiles().isEmpty()) {
            uploadAttachmentUseCase.uploadAll(TargetType.NOTICE.name(), command.getNoticeId(), command.getNewFiles());
        }

        AdminNotice saved = adminNoticePort.save(updated);

        // 푸시 알림 발송
        if (Boolean.TRUE.equals(command.getSendPush())) {
            systemNotificationUseCase.sendNoticeNotification(saved.getId(), saved.getTitle(), saved.getSummary());
        }

        return saved;
    }

    @Override
    public void delete(Long noticeId) {
        adminNoticePort.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_001, "noticeId=" + noticeId));

        // 첨부파일 전체 삭제 (attachment 공통 모듈 사용)
        deleteAttachmentUseCase.deleteAllByTarget(TargetType.NOTICE.name(), noticeId);
        adminNoticePort.deleteById(noticeId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminNotice> getAdminNotices(int page, int size, String searchType, String keyword, Boolean isPinned,
            Boolean isPopup, Boolean isPushed, String category, String status) {
        Sort sort = Sort.by("isPinned").descending()
                .and(Sort.by("createdAt").descending());

        // 카테고리 문자열 → Enum 변환
        NoticeCategory categoryEnum = null;
        if (category != null && !category.isBlank()) {
            try {
                categoryEnum = NoticeCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        return adminNoticePort.findAll(PageRequest.of(page - 1, size, sort), searchType, keyword, isPinned, isPopup,
                isPushed, categoryEnum, status);
    }
}
