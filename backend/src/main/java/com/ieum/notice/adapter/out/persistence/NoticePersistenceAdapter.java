package com.ieum.notice.adapter.out.persistence;

import com.ieum.notice.application.port.out.NoticePort;
import com.ieum.notice.domain.model.Notice;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 공지사항 영속성 어댑터 (Port OUT 구현체)
 */
@Component
@RequiredArgsConstructor
public class NoticePersistenceAdapter implements NoticePort {

    private final NoticeJpaRepository noticeJpaRepository;

    @Override
    public Notice save(Notice notice) {
        return noticeJpaRepository.save(notice);
    }

    @Override
    public Optional<Notice> findById(Long noticeId) {
        return noticeJpaRepository.findById(noticeId);
    }

    @Override
    public Page<Notice> findAll(String searchType, String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return noticeJpaRepository.findAll(pageable);
        }

        return switch (searchType != null ? searchType : "all") {
            case "title" -> noticeJpaRepository.findByTitleContaining(keyword, pageable);
            case "content" -> noticeJpaRepository.findByContentContaining(keyword, pageable);
            default -> noticeJpaRepository.findByTitleOrContentContaining(keyword, pageable);
        };
    }

    @Override
    public Optional<Notice> findPopupNotice() {
        return noticeJpaRepository.findTopPopupNotice(LocalDateTime.now());
    }

    @Override
    public Optional<Notice> findPrevious(Long noticeId) {
        return noticeJpaRepository.findFirstByIdLessThanOrderByIdDesc(noticeId);
    }

    @Override
    public Optional<Notice> findNext(Long noticeId) {
        return noticeJpaRepository.findFirstByIdGreaterThanOrderByIdAsc(noticeId);
    }

    @Override
    public void deleteById(Long noticeId) {
        noticeJpaRepository.deleteById(noticeId);
    }
}
