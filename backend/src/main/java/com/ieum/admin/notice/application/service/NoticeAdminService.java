package com.ieum.admin.notice.application.service;

import com.ieum.admin.notice.application.port.in.CreateNoticeUseCase;
import com.ieum.admin.notice.application.port.in.DeleteNoticeUseCase;
import com.ieum.admin.notice.application.port.in.GetAdminNoticeListUseCase;
import com.ieum.admin.notice.application.port.in.UpdateNoticeUseCase;
import com.ieum.admin.notice.application.port.out.AdminNoticePort;
import com.ieum.admin.notice.domain.AdminNotice;
import com.ieum.attachment.application.port.in.DeleteAttachmentUseCase;
import com.ieum.attachment.application.port.in.UploadAttachmentUseCase;
import com.ieum.user.notification.application.port.in.SystemNotificationUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

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
    public AdminNotice create(String title, String content, String summary,
            Boolean isPinned, Boolean isPopup, Boolean sendPush, Boolean isActive,
            LocalDateTime startDate, LocalDateTime endDate,
            List<MultipartFile> files) {

        AdminNotice notice = AdminNotice.builder()
                .title(title)
                .content(content)
                .summary(summary)
                .isPinned(isPinned != null ? isPinned : false)
                .isPopup(isPopup != null ? isPopup : false)
                .isPushed(Boolean.TRUE.equals(sendPush))
                .isActive(isActive != null ? isActive : true)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        AdminNotice saved = adminNoticePort.save(notice);

        // 첨부파일 업로드 (attachment 공통 모듈 사용)
        if (files != null && !files.isEmpty()) {
            uploadAttachmentUseCase.uploadAll("NOTICE", saved.getId(), files);
        }

        // 푸시 알림 발송
        if (Boolean.TRUE.equals(sendPush)) {
            systemNotificationUseCase.sendNoticeNotification(saved.getId(), saved.getTitle(), saved.getSummary());
        }

        return saved;
    }

    @Override
    public AdminNotice update(Long noticeId, String title, String content, String summary,
            Boolean isPinned, Boolean isPopup, Boolean sendPush, Boolean isActive,
            LocalDateTime startDate, LocalDateTime endDate,
            List<MultipartFile> newFiles, List<Long> deleteFileIds) {

        AdminNotice notice = adminNoticePort.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다. id=" + noticeId));

        AdminNotice updated = AdminNotice.builder()
                .id(notice.getId())
                .title(title)
                .content(content)
                .summary(summary)
                .viewCount(notice.getViewCount())
                .isPinned(isPinned != null ? isPinned : notice.getIsPinned())
                .isPopup(isPopup != null ? isPopup : notice.getIsPopup())
                .isPushed(Boolean.TRUE.equals(sendPush) || notice.getIsPushed())
                .isActive(isActive != null ? isActive : notice.getIsActive())
                .startDate(startDate != null ? startDate : notice.getStartDate())
                .endDate(endDate != null ? endDate : notice.getEndDate())
                .createdAt(notice.getCreatedAt())
                .build();

        // 삭제할 기존 파일 처리
        if (deleteFileIds != null && !deleteFileIds.isEmpty()) {
            deleteFileIds.forEach(deleteAttachmentUseCase::delete);
        }

        // 새 파일 업로드
        if (newFiles != null && !newFiles.isEmpty()) {
            uploadAttachmentUseCase.uploadAll("NOTICE", noticeId, newFiles);
        }

        AdminNotice saved = adminNoticePort.save(updated);

        // 푸시 알림 발송
        if (Boolean.TRUE.equals(sendPush)) {
            systemNotificationUseCase.sendNoticeNotification(saved.getId(), saved.getTitle(), saved.getSummary());
        }

        return saved;
    }

    @Override
    public void delete(Long noticeId) {
        adminNoticePort.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다. id=" + noticeId));

        // 첨부파일 전체 삭제 (attachment 공통 모듈 사용)
        deleteAttachmentUseCase.deleteAllByTarget("NOTICE", noticeId);
        adminNoticePort.deleteById(noticeId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminNotice> getAdminNotices(int page, int size, String searchType, String keyword, Boolean isPinned,
            Boolean isPopup, Boolean isPushed, String status) {
        Sort sort = Sort.by("isPinned").descending()
                .and(Sort.by("createdAt").descending());
        return adminNoticePort.findAll(PageRequest.of(page - 1, size, sort), searchType, keyword, isPinned, isPopup,
                isPushed, status);
    }
}
