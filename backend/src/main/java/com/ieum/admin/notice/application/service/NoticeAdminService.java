package com.ieum.admin.notice.application.service;

import com.ieum.admin.notice.application.port.in.CreateNoticeUseCase;
import com.ieum.admin.notice.application.port.in.DeleteNoticeUseCase;
import com.ieum.admin.notice.application.port.in.GetAdminNoticeListUseCase;
import com.ieum.admin.notice.application.port.in.UpdateNoticeUseCase;
import com.ieum.attachment.application.port.in.DeleteAttachmentUseCase;
import com.ieum.attachment.application.port.in.UploadAttachmentUseCase;
import com.ieum.notice.application.port.out.NoticePort;
import com.ieum.notice.domain.model.Notice;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 관리자용 공지사항 서비스 (UseCase 구현체)
 * - attachment 공통 모듈의 UseCase를 주입받아 파일 처리
 * - notice 도메인의 Port OUT을 주입받아 DB 접근
 */
@Service
@RequiredArgsConstructor
@Transactional
public class NoticeAdminService implements CreateNoticeUseCase, UpdateNoticeUseCase, DeleteNoticeUseCase, GetAdminNoticeListUseCase {

    private final NoticePort noticePort;
    private final UploadAttachmentUseCase uploadAttachmentUseCase;
    private final DeleteAttachmentUseCase deleteAttachmentUseCase;

    @Override
    public Notice create(String title, String content, String summary,
                         Boolean isPinned, Boolean isPopup,
                         List<MultipartFile> files) {

        Notice notice = Notice.builder()
                .title(title)
                .content(content)
                .summary(summary)
                .isPinned(isPinned != null ? isPinned : false)
                .isPopup(isPopup != null ? isPopup : false)
                .build();

        Notice saved = noticePort.save(notice);

        // 첨부파일 업로드 (attachment 공통 모듈 사용)
        if (files != null && !files.isEmpty()) {
            uploadAttachmentUseCase.uploadAll("NOTICE", saved.getId(), files);
        }

        return saved;
    }

    @Override
    public Notice update(Long noticeId, String title, String content, String summary,
                         Boolean isPinned, Boolean isPopup,
                         List<MultipartFile> newFiles, List<Long> deleteFileIds) {

        Notice notice = noticePort.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다. id=" + noticeId));

        notice.setTitle(title);
        notice.setContent(content);
        notice.setSummary(summary);
        if (isPinned != null) notice.setIsPinned(isPinned);
        if (isPopup != null) notice.setIsPopup(isPopup);

        // 삭제할 기존 파일 처리
        if (deleteFileIds != null && !deleteFileIds.isEmpty()) {
            deleteFileIds.forEach(deleteAttachmentUseCase::delete);
        }

        // 새 파일 업로드
        if (newFiles != null && !newFiles.isEmpty()) {
            uploadAttachmentUseCase.uploadAll("NOTICE", noticeId, newFiles);
        }

        return noticePort.save(notice);
    }

    @Override
    public void delete(Long noticeId) {
        noticePort.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다. id=" + noticeId));

        // 첨부파일 전체 삭제 (attachment 공통 모듈 사용)
        deleteAttachmentUseCase.deleteAllByTarget("NOTICE", noticeId);
        noticePort.deleteById(noticeId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notice> getAdminNotices(int page, int size) {
        Sort sort = Sort.by("createdAt").descending();
        return noticePort.findAll(null, null, PageRequest.of(page - 1, size, sort));
    }
}
