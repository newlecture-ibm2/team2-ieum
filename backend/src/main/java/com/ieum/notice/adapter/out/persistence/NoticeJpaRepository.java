package com.ieum.notice.adapter.out.persistence;

import com.ieum.notice.domain.model.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 공지사항 JPA 리포지토리
 */
@Repository
public interface NoticeJpaRepository extends JpaRepository<Notice, Long> {

    /**
     * 제목 검색
     */
    Page<Notice> findByTitleContaining(String keyword, Pageable pageable);

    /**
     * 내용 검색
     */
    Page<Notice> findByContentContaining(String keyword, Pageable pageable);

    /**
     * 제목+내용 검색 (JPA 네이밍)
     */
    Page<Notice> findByTitleContainingOrContentContaining(String titleKeyword, String contentKeyword, Pageable pageable);

    /**
     * 팝업 공지 (isPopup=true, 현재 기간 내, 최신 1건)
     * - IS NULL OR 조건은 JPA 네이밍으로 표현 불가하여 @Query 유지
     */
    @Query("SELECT n FROM Notice n WHERE n.isPopup = true " +
           "AND (n.startDate IS NULL OR n.startDate <= :now) " +
           "AND (n.endDate IS NULL OR n.endDate >= :now) " +
           "ORDER BY n.createdAt DESC LIMIT 1")
    Optional<Notice> findTopPopupNotice(@Param("now") LocalDateTime now);

    /**
     * 이전글
     */
    Optional<Notice> findFirstByIdLessThanOrderByIdDesc(Long noticeId);

    /**
     * 다음글
     */
    Optional<Notice> findFirstByIdGreaterThanOrderByIdAsc(Long noticeId);
}
