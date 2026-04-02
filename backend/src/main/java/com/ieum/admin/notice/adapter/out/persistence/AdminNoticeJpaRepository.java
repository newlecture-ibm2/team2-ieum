package com.ieum.admin.notice.adapter.out.persistence;

import com.ieum.admin.notice.adapter.out.persistence.entity.AdminNoticeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 관리자용 공지사항 JPA 리포지토리
 */
@Repository
public interface AdminNoticeJpaRepository extends JpaRepository<AdminNoticeJpaEntity, Long> {
}
