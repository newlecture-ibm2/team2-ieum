package com.ieum.admin.notice.adapter.out.persistence;

import com.ieum.admin.notice.adapter.out.persistence.entity.AdminNoticeJpaEntity;
import com.ieum.admin.notice.application.port.out.AdminNoticePort;
import com.ieum.admin.notice.domain.AdminNotice;
import com.ieum.notice.domain.model.NoticeCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 관리자용 공지사항 영속성 어댑터
 */
@Component
@RequiredArgsConstructor
public class AdminNoticePersistenceAdapter implements AdminNoticePort {

    private final AdminNoticeJpaRepository adminNoticeJpaRepository;

    @Override
    public AdminNotice save(AdminNotice notice) {
        AdminNoticeJpaEntity entity = AdminNoticeJpaEntity.fromDomain(notice);
        return adminNoticeJpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<AdminNotice> findById(Long noticeId) {
        return adminNoticeJpaRepository.findById(noticeId)
                .map(AdminNoticeJpaEntity::toDomain);
    }

    @Override
    public Page<AdminNotice> findAll(Pageable pageable, String searchType, String keyword, Boolean isPinned,
            Boolean isPopup, Boolean isPushed, NoticeCategory category, String status) {
        return adminNoticeJpaRepository
                .findWithFilters(searchType, keyword, isPinned, isPopup, isPushed, category, status,
                        java.time.LocalDateTime.now(), pageable)
                .map(AdminNoticeJpaEntity::toDomain);
    }

    @Override
    public void deleteById(Long noticeId) {
        adminNoticeJpaRepository.deleteById(noticeId);
    }

    @Override
    public boolean existsPopupActive() {
        return adminNoticeJpaRepository.existsByIsPopupTrue();
    }

    @Override
    public boolean existsPopupActiveExcept(Long noticeId) {
        return adminNoticeJpaRepository.existsByIsPopupTrueAndIdNot(noticeId);
    }
}
