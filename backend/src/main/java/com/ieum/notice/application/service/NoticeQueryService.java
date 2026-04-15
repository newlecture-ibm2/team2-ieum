package com.ieum.notice.application.service;

import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import com.ieum.notice.adapter.in.web.dto.NoticeDetailResponse;
import com.ieum.notice.application.port.in.GetNoticeDetailUseCase;
import com.ieum.notice.application.port.in.GetNoticeListUseCase;
import com.ieum.notice.application.port.in.GetPopupNoticeUseCase;
import com.ieum.notice.application.port.out.NoticePort;
import com.ieum.notice.domain.model.Notice;
import com.ieum.notice.domain.model.NoticeCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 사용자용 공지사항 서비스 (UseCase 구현체)
 * - 정렬/페이징 등 모든 로직이 서비스 내부에서 처리됨
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeQueryService implements GetNoticeListUseCase, GetNoticeDetailUseCase, GetPopupNoticeUseCase {

    private final NoticePort noticePort;

    @Override
    public Page<Notice> getNotices(String searchType, String keyword, String category, int page, int size) {
        // 정렬 기준: 고정 공지 우선 → 최신순
        Sort sort = Sort.by("isPinned").descending()
                .and(Sort.by("createdAt").descending());

        // 카테고리 문자열 → Enum 변환 (null이면 전체 조회)
        NoticeCategory categoryEnum = null;
        if (category != null && !category.isBlank()) {
            try {
                categoryEnum = NoticeCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // 잘못된 카테고리 값은 무시하고 전체 조회
            }
        }

        return noticePort.findActiveAll(searchType, keyword, categoryEnum, LocalDateTime.now(), PageRequest.of(page - 1, size, sort));
    }

    @Override
    @Transactional
    public NoticeDetailResponse getNoticeDetail(Long noticeId) {
        Notice notice = noticePort.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_001, "noticeId=" + noticeId));

        // 사용자용 상세 조회이므로 활성 상태 및 게시 기간 검증
        LocalDateTime now = LocalDateTime.now();
        if (Boolean.FALSE.equals(notice.getIsActive()) ||
                (notice.getStartDate() != null && notice.getStartDate().isAfter(now)) ||
                (notice.getEndDate() != null && notice.getEndDate().isBefore(now))) {
            throw new BusinessException(ErrorCode.NOTICE_002, "접근 불가 공지 id=" + noticeId);
        }

        // 조회수 증가
        Notice updated = Notice.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .summary(notice.getSummary())
                .category(notice.getCategory())
                .viewCount(notice.getViewCount() + 1)
                .isPinned(notice.getIsPinned())
                .isPopup(notice.getIsPopup())
                .isActive(notice.getIsActive())
                .startDate(notice.getStartDate())
                .endDate(notice.getEndDate())
                .createdAt(notice.getCreatedAt())
                .build();
        noticePort.save(updated);

        return new NoticeDetailResponse(
                notice,
                noticePort.findPrevious(noticeId).orElse(null),
                noticePort.findNext(noticeId).orElse(null)
        );
    }

    @Override
    public List<Notice> getPopupNotices() {
        return noticePort.findPopupNotices();
    }
}

