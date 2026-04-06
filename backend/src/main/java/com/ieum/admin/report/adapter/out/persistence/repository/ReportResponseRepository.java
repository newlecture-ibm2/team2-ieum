package com.ieum.admin.report.adapter.out.persistence.repository;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportResponseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 신고 처리 답변 JPA Repository
 */
public interface ReportResponseRepository extends JpaRepository<ReportResponseEntity, Long> {
}
