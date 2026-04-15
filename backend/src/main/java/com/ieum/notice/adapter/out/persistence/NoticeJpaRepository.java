package com.ieum.notice.adapter.out.persistence;

import com.ieum.notice.adapter.out.persistence.entity.NoticeJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 공지사항 JPA 리포지토리
 */
@Repository
public interface NoticeJpaRepository extends JpaRepository<NoticeJpaEntity, Long> {

    Page<NoticeJpaEntity> findByTitleContaining(String keyword, Pageable pageable);

    Page<NoticeJpaEntity> findByContentContaining(String keyword, Pageable pageable);

    Page<NoticeJpaEntity> findByTitleContainingOrContentContaining(String titleKeyword, String contentKeyword,
            Pageable pageable);

    @Query("SELECT n FROM NoticeJpaEntity n WHERE n.isPopup = true " +
            "AND (n.startDate IS NULL OR n.startDate <= :now) " +
            "AND (n.endDate IS NULL OR n.endDate >= :now) " +
            "ORDER BY n.createdAt DESC")
    List<NoticeJpaEntity> findPopupNotices(@Param("now") LocalDateTime now);

    @Query("SELECT n FROM NoticeJpaEntity n WHERE n.isActive = true " +
            "AND (n.startDate IS NULL OR n.startDate <= :now) " +
            "AND (n.endDate IS NULL OR n.endDate >= :now) " +
            "AND (:keyword IS NULL OR n.title LIKE %:keyword% OR n.content LIKE %:keyword%) " +
            "AND (:category IS NULL OR n.category = :category)")
    Page<NoticeJpaEntity> findActiveNotices(@Param("keyword") String keyword, @Param("now") LocalDateTime now,
            @Param("category") com.ieum.notice.domain.model.NoticeCategory category, Pageable pageable);

    @Query("SELECT n FROM NoticeJpaEntity n WHERE n.isActive = true " +
            "AND (n.startDate IS NULL OR n.startDate <= :now) " +
            "AND (n.endDate IS NULL OR n.endDate >= :now) " +
            "AND (:keyword IS NULL OR n.title LIKE %:keyword%) " +
            "AND (:category IS NULL OR n.category = :category)")
    Page<NoticeJpaEntity> findActiveNoticesByTitle(@Param("keyword") String keyword, @Param("now") LocalDateTime now,
            @Param("category") com.ieum.notice.domain.model.NoticeCategory category, Pageable pageable);

    @Query("SELECT n FROM NoticeJpaEntity n WHERE n.isActive = true " +
            "AND (n.startDate IS NULL OR n.startDate <= :now) " +
            "AND (n.endDate IS NULL OR n.endDate >= :now) " +
            "AND (:keyword IS NULL OR n.content LIKE %:keyword%) " +
            "AND (:category IS NULL OR n.category = :category)")
    Page<NoticeJpaEntity> findActiveNoticesByContent(@Param("keyword") String keyword, @Param("now") LocalDateTime now,
            @Param("category") com.ieum.notice.domain.model.NoticeCategory category, Pageable pageable);

    Optional<NoticeJpaEntity> findFirstByIdLessThanOrderByIdDesc(Long noticeId);

    Optional<NoticeJpaEntity> findFirstByIdGreaterThanOrderByIdAsc(Long noticeId);
}
