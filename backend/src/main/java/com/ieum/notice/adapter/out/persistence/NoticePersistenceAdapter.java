package com.ieum.notice.adapter.out.persistence;

import com.ieum.notice.adapter.out.persistence.entity.NoticeJpaEntity;
import com.ieum.notice.application.port.out.NoticePort;
import com.ieum.notice.domain.model.Notice;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 공지사항 영속성 어댑터 (Port OUT 구현체)
 */
@Component
@RequiredArgsConstructor
public class NoticePersistenceAdapter implements NoticePort {

    private final NoticeJpaRepository noticeJpaRepository;

    @Override
    public Notice save(Notice notice) {
        NoticeJpaEntity entity = NoticeJpaEntity.fromDomain(notice);
        return noticeJpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<Notice> findById(Long noticeId) {
        return noticeJpaRepository.findById(noticeId)
                .map(NoticeJpaEntity::toDomain);
    }

    @Override
    public Page<Notice> findAll(String searchType, String keyword, Pageable pageable) {
        Page<NoticeJpaEntity> page;

        if (keyword == null || keyword.isBlank()) {
            page = noticeJpaRepository.findAll(pageable);
        } else {
            page = switch (searchType != null ? searchType : "all") {
                case "title" -> noticeJpaRepository.findByTitleContaining(keyword, pageable);
                case "content" -> noticeJpaRepository.findByContentContaining(keyword, pageable);
                default -> noticeJpaRepository.findByTitleContainingOrContentContaining(keyword, keyword, pageable);
            };
        }

        return page.map(NoticeJpaEntity::toDomain);
    }

    @Override
    public List<Notice> findPopupNotices() {
        return noticeJpaRepository.findPopupNotices(LocalDateTime.now())
                .stream()
                .map(NoticeJpaEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Notice> findPrevious(Long noticeId) {
        return noticeJpaRepository.findFirstByIdLessThanOrderByIdDesc(noticeId)
                .map(NoticeJpaEntity::toDomain);
    }

    @Override
    public Optional<Notice> findNext(Long noticeId) {
        return noticeJpaRepository.findFirstByIdGreaterThanOrderByIdAsc(noticeId)
                .map(NoticeJpaEntity::toDomain);
    }

    @Override
    public void deleteById(Long noticeId) {
        noticeJpaRepository.deleteById(noticeId);
    }
}
