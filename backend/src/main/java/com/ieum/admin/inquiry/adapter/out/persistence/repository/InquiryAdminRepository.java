package com.ieum.admin.inquiry.adapter.out.persistence.repository;

import com.ieum.admin.inquiry.adapter.out.persistence.entity.InquiryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * 문의 JPA Repository
 * - inquiries JOIN users 로 작성자 닉네임 가져오기
 * - LOWER() 기반 대소문자 무시 검색
 */
public interface InquiryAdminRepository extends JpaRepository<InquiryEntity, Long> {

    /* ── 동적 검색 쿼리 (LOWER 적용) ── */
    @Query("SELECT i, u.nickname FROM InquiryEntity i " +
           "LEFT JOIN com.ieum.admin.report.adapter.out.persistence.entity.UserRef u ON u.id = i.userId " +
           "WHERE (:status IS NULL OR :status = '' OR i.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "  ((:searchType IS NULL OR :searchType = 'ALL' OR :searchType = '') AND (LOWER(i.title) LIKE LOWER(CONCAT('%',:keyword,'%')) OR LOWER(u.nickname) LIKE LOWER(CONCAT('%',:keyword,'%')) OR LOWER(i.content) LIKE LOWER(CONCAT('%',:keyword,'%')))) OR " +
           "  (:searchType = 'TITLE' AND LOWER(i.title) LIKE LOWER(CONCAT('%',:keyword,'%'))) OR " +
           "  (:searchType = 'AUTHOR' AND LOWER(u.nickname) LIKE LOWER(CONCAT('%',:keyword,'%'))) OR " +
           "  (:searchType = 'CONTENT' AND LOWER(i.content) LIKE LOWER(CONCAT('%',:keyword,'%')))" +
           ") " +
           "ORDER BY i.createdAt DESC")
    Page<Object[]> findInquiriesByConditions(@Param("status") String status,
                                             @Param("searchType") String searchType,
                                             @Param("keyword") String keyword,
                                             Pageable pageable);

    /* ── 단건 조회 (닉네임 포함) ── */
    @Query("SELECT i, u.nickname FROM InquiryEntity i " +
           "LEFT JOIN com.ieum.admin.report.adapter.out.persistence.entity.UserRef u ON u.id = i.userId " +
           "WHERE i.id = :id")
    Optional<Object[]> findInquiryWithNickname(@Param("id") Long id);

    long countByStatus(String status);

    /* ── 사용자별 문의 내역 조회 (최신순) ── */
    java.util.List<InquiryEntity> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}
