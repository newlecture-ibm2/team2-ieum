package com.ieum.admin.report.application.port.out;

import com.ieum.admin.report.domain.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 신고 데이터 접근 OutPort
 */
public interface ReportPort {
    Page<Report> findAll(String status, String targetType, String searchType, String keyword, Pageable pageable);
    Optional<Report> findById(Long id);
    void updateStatus(Long id, String status, String action, String adminNote);
    void saveResponse(Long reportId, Long adminId, String actionType, String message);
    long countByStatus(String status);
}
