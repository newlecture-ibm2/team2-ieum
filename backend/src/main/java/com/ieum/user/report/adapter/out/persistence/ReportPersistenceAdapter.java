package com.ieum.user.report.adapter.out.persistence;

import com.ieum.user.report.adapter.out.persistence.entity.UserReportEntity;
import com.ieum.user.report.adapter.out.persistence.repository.ReportRepository;
import com.ieum.user.report.application.port.out.ReportPort;
import com.ieum.user.report.domain.model.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component("userReportPersistenceAdapter")
@RequiredArgsConstructor
public class ReportPersistenceAdapter implements ReportPort {

    private final ReportRepository reportRepository;

    @Override
    public Report save(Report report) {
        UserReportEntity entity = UserReportEntity.builder()
                .id(report.getId())
                .reporterId(report.getReporterId())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .action(report.getAction())
                .adminNote(report.getAdminNote())
                .createdAt(report.getCreatedAt())
                .processedAt(report.getProcessedAt())
                .build();

        UserReportEntity saved = reportRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Report> findByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType,
            Long targetId) {
        return reportRepository.findByReporterIdAndTargetTypeAndTargetId(reporterId, targetType, targetId)
                .map(this::toDomain);
    }

    @Override
    public List<Long> findTargetIdsByReporterIdAndTargetTypeAndStatusIn(Long reporterId, String targetType,
            List<String> statuses) {
        return reportRepository.findTargetIdsByReporterIdAndTargetTypeAndStatusIn(reporterId, targetType, statuses);
    }

    @Override
    public List<Report> findAllByReporterId(Long reporterId) {
        return reportRepository.findAllByReporterIdOrderByCreatedAtDesc(reporterId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<Report> findByIdAndReporterId(Long id, Long reporterId) {
        return reportRepository.findByIdAndReporterId(id, reporterId)
                .map(this::toDomain);
    }

    private Report toDomain(UserReportEntity entity) {
        return Report.builder()
                .id(entity.getId())
                .reporterId(entity.getReporterId())
                .targetType(entity.getTargetType())
                .targetId(entity.getTargetId())
                .reason(entity.getReason())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .action(entity.getAction())
                .adminNote(entity.getAdminNote())
                .createdAt(entity.getCreatedAt())
                .processedAt(entity.getProcessedAt())
                .build();
    }
}
