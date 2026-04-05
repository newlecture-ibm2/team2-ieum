package com.ieum.admin.report.adapter.out.persistence;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportEntity;
import com.ieum.admin.report.adapter.out.persistence.repository.ReportAdminRepository;
import com.ieum.admin.report.application.port.out.ReportPort;
import com.ieum.admin.report.domain.model.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 신고 Persistence Adapter (OutPort 구현체)
 */
@Component
@RequiredArgsConstructor
public class ReportPersistenceAdapter implements ReportPort {

    private final ReportAdminRepository repository;

    @Override
    public Page<Report> findAll(String status, String targetType, Pageable pageable) {
        Page<Object[]> page;

        if (status != null && targetType != null) {
            page = repository.findByStatusAndTargetTypeWithNickname(status, targetType, pageable);
        } else if (status != null) {
            page = repository.findByStatusWithNickname(status, pageable);
        } else if (targetType != null) {
            page = repository.findByTargetTypeWithNickname(targetType, pageable);
        } else {
            page = repository.findAllWithNickname(pageable);
        }

        var reports = page.getContent().stream().map(row -> {
            ReportEntity entity = (ReportEntity) row[0];
            String nickname = (String) row[1];
            entity.setReporterNickname(nickname != null ? nickname : "알 수 없음");
            return entity.toDomain();
        }).toList();

        return new PageImpl<>(reports, pageable, page.getTotalElements());
    }

    @Override
    public Optional<Report> findById(Long id) {
        return repository.findById(id).map(entity -> {
            entity.setReporterNickname(""); // 상세 조회 시 닉네임은 추후 보강
            return entity.toDomain();
        });
    }

    @Override
    public void updateStatus(Long id, String status, String action, String adminNote) {
        repository.findById(id).ifPresent(entity -> {
            entity.setStatus(status);
            entity.setAction(action);
            entity.setAdminNote(adminNote);
            entity.setProcessedAt(LocalDateTime.now());
            repository.save(entity);
        });
    }

    @Override
    public long countByStatus(String status) {
        return repository.countByStatus(status);
    }
}
