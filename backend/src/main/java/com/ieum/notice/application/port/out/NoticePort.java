package com.ieum.notice.application.port.out;

import com.ieum.notice.domain.model.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * 공지사항 영속성 포트 (Port OUT)
 * - Service가 이 인터페이스를 호출, PersistenceAdapter가 구현
 */
public interface NoticePort {

    Notice save(Notice notice);

    Optional<Notice> findById(Long noticeId);

    Page<Notice> findAll(String searchType, String keyword, Pageable pageable);

    /**
     * 팝업 공지 리스트 (isPopup=true, 현재 유효 기간 내 목록)
     */
    List<Notice> findPopupNotices();

    /**
     * 이전글 (현재 ID보다 작은 것 중 가장 큰 것)
     */
    Optional<Notice> findPrevious(Long noticeId);

    /**
     * 다음글 (현재 ID보다 큰 것 중 가장 작은 것)
     */
    Optional<Notice> findNext(Long noticeId);

    void deleteById(Long noticeId);
}
