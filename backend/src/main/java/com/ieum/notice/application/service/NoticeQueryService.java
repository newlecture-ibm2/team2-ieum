package com.ieum.notice.application.service;

import com.ieum.notice.application.port.in.GetNoticeDetailUseCase;
import com.ieum.notice.application.port.in.GetNoticeListUseCase;
import com.ieum.notice.application.port.in.GetPopupNoticeUseCase;
import com.ieum.notice.application.port.out.NoticePort;
import com.ieum.notice.domain.model.Notice;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

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
    public Page<Notice> getNotices(String searchType, String keyword, int page, int size) {
        // 정렬 기준: 고정 공지 우선 → 최신순
        Sort sort = Sort.by("isPinned").descending()
                .and(Sort.by("createdAt").descending());
        return noticePort.findAll(searchType, keyword, PageRequest.of(page - 1, size, sort));
    }

    @Override
    @Transactional
    public Map<String, Object> getNoticeDetail(Long noticeId) {
        Notice notice = noticePort.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다. id=" + noticeId));

        // 조회수 증가
        notice.setViewCount(notice.getViewCount() + 1);
        noticePort.save(notice);

        Map<String, Object> result = new HashMap<>();
        result.put("notice", notice);
        result.put("prevNotice", noticePort.findPrevious(noticeId).orElse(null));
        result.put("nextNotice", noticePort.findNext(noticeId).orElse(null));

        return result;
    }

    @Override
    public Notice getPopupNotice() {
        return noticePort.findPopupNotice().orElse(null);
    }
}
