package com.ieum.admin.notice.adapter.out.persistence;

import com.ieum.admin.notice.adapter.out.persistence.entity.AdminNoticeJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 관리자용 공지사항 JPA 리포지토리
 */
@Repository
public interface AdminNoticeJpaRepository extends JpaRepository<AdminNoticeJpaEntity, Long> {

    @Query("SELECT n FROM AdminNotice n WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "    (:searchType = 'TITLE' AND n.title LIKE %:keyword%) OR " +
            "    (:searchType = 'CONTENT' AND n.content LIKE %:keyword%) OR " +
            "    ((:searchType IS NULL OR :searchType = 'ALL') AND (n.title LIKE %:keyword% OR n.content LIKE %:keyword%))"
            +
            ") AND " +
            "(:isPinned IS NULL OR n.isPinned = :isPinned) AND " +
            "(:isPopup IS NULL OR n.isPopup = :isPopup) AND " +
            "(:isPushed IS NULL OR n.isPushed = :isPushed) AND " +
            "(:category IS NULL OR n.category = :category) AND " +
            "(:status IS NULL OR :status = '' OR " +
            "    (:status = 'ACTIVE' AND n.isActive = true AND (n.startDate IS NULL OR n.startDate <= :now) AND (n.endDate IS NULL OR n.endDate >= :now)) OR "
            +
            "    (:status = 'INACTIVE' AND n.isActive = false) OR " +
            "    (:status = 'RESERVED' AND n.isActive = true AND n.startDate > :now) OR " +
            "    (:status = 'ENDED' AND n.isActive = true AND n.endDate < :now)" +
            ")")
    Page<AdminNoticeJpaEntity> findWithFilters(@Param("searchType") String searchType,
            @Param("keyword") String keyword,
            @Param("isPinned") Boolean isPinned,
            @Param("isPopup") Boolean isPopup,
            @Param("isPushed") Boolean isPushed,
            @Param("category") com.ieum.notice.domain.model.NoticeCategory category,
            @Param("status") String status,
            @Param("now") java.time.LocalDateTime now,
            Pageable pageable);

    boolean existsByIsPopupTrue();

    boolean existsByIsPopupTrueAndIdNot(Long id);
}
