package com.ieum.admin.notice.application.port.out;

import com.ieum.admin.notice.domain.AdminNotice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 관리자용 공지사항 출력 포트
 */
public interface AdminNoticePort {

    AdminNotice save(AdminNotice notice);

    Optional<AdminNotice> findById(Long noticeId);

    Page<AdminNotice> findAll(Pageable pageable, String searchType, String keyword, Boolean isPinned, Boolean isPopup,
            Boolean isPushed, String status);

    void deleteById(Long noticeId);

    boolean existsPopupActive();

    boolean existsPopupActiveExcept(Long noticeId);
}
