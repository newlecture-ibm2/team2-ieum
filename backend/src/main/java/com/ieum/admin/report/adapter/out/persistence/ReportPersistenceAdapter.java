package com.ieum.admin.report.adapter.out.persistence;

import com.ieum.admin.report.adapter.out.persistence.entity.ReportEntity;
import com.ieum.admin.report.adapter.out.persistence.entity.ReportResponseEntity;
import com.ieum.admin.report.adapter.out.persistence.repository.ReportAdminRepository;
import com.ieum.admin.report.adapter.out.persistence.repository.ReportResponseRepository;
import com.ieum.admin.report.application.port.out.ReportPort;
import com.ieum.admin.report.domain.model.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import jakarta.persistence.EntityManager;

/**
 * 신고 Persistence Adapter (OutPort 구현체)
 */
@Component
@RequiredArgsConstructor
public class ReportPersistenceAdapter implements ReportPort {

    private final EntityManager em;
    private final ReportAdminRepository repository;
    private final ReportResponseRepository responseRepository;

    @Override
    public Page<Report> findAll(String status, String targetType, String searchType, String keyword, Pageable pageable) {
        Page<Object[]> page = repository.findReportsByConditions(status, targetType, searchType, keyword, pageable);

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
    public void saveResponse(Long reportId, Long adminId, String actionType, String message) {
        ReportResponseEntity response = ReportResponseEntity.builder()
                .reportId(reportId)
                .adminId(adminId)
                .actionType(actionType)
                .message(message)
                .build();
        responseRepository.save(response);
    }

    @Override
    public long countByStatus(String status) {
        return repository.countByStatus(status);
    }

    @Override
    public Map<String, String> findOriginalContent(String targetType, Long targetId) {
        Map<String, String> result = new HashMap<>();
        try {
            if ("POST".equalsIgnoreCase(targetType)) {
                Object[] row = (Object[]) em.createQuery("SELECT p.authorName, p.content, p.createdAt FROM PostEntity p WHERE p.id = :id")
                        .setParameter("id", targetId).getSingleResult();
                result.put("author", (String) row[0]);
                result.put("content", (String) row[1]);
                result.put("createdAt", row[2] != null ? row[2].toString() : "");
                return result;
            } else if ("COMMENT".equalsIgnoreCase(targetType)) {
                Object[] row = (Object[]) em.createQuery("SELECT c.userName, c.content, c.createdAt FROM CommentEntity c WHERE c.id = :id")
                        .setParameter("id", targetId).getSingleResult();
                result.put("author", (String) row[0]);
                result.put("content", (String) row[1]);
                result.put("createdAt", row[2] != null ? row[2].toString() : "");
                return result;
            } else if ("REVIEW".equalsIgnoreCase(targetType)) {
                Object[] row = (Object[]) em.createQuery("SELECT u.nickname, r.content, r.createdAt FROM ReviewEntity r LEFT JOIN UserRef u ON r.userId = u.id WHERE r.id = :id")
                        .setParameter("id", targetId).getSingleResult();
                result.put("author", row[0] != null ? (String) row[0] : "알 수 없음");
                result.put("content", (String) row[1]);
                result.put("createdAt", row[2] != null ? row[2].toString() : "");
                return result;
            }
        } catch (Exception e) {
            return null; // 못 찾거나 삭제된 경우
        }
        return null; // 알 수 없는 타입
    }

    @Override
    public Long findTargetAuthorId(String targetType, Long targetId) {
        try {
            if ("POST".equalsIgnoreCase(targetType)) {
                return (Long) em.createQuery("SELECT p.authorId FROM PostEntity p WHERE p.id = :id")
                        .setParameter("id", targetId).getSingleResult();
            } else if ("COMMENT".equalsIgnoreCase(targetType)) {
                return (Long) em.createQuery("SELECT c.userId FROM CommentEntity c WHERE c.id = :id")
                        .setParameter("id", targetId).getSingleResult();
            } else if ("REVIEW".equalsIgnoreCase(targetType)) {
                return (Long) em.createQuery("SELECT r.userId FROM ReviewEntity r WHERE r.id = :id")
                        .setParameter("id", targetId).getSingleResult();
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    @Override
    public void hideTargetContent(String targetType, Long targetId) {
        if ("POST".equalsIgnoreCase(targetType)) {
            em.createQuery("UPDATE PostEntity p SET p.status = 'REMOVED' WHERE p.id = :id")
                    .setParameter("id", targetId)
                    .executeUpdate();
        } else if ("COMMENT".equalsIgnoreCase(targetType)) {
            em.createQuery("UPDATE CommentEntity c SET c.status = 'REMOVED' WHERE c.id = :id")
                    .setParameter("id", targetId)
                    .executeUpdate();
        } else if ("REVIEW".equalsIgnoreCase(targetType)) {
            em.createQuery("UPDATE ReviewEntity r SET r.status = 'REMOVED' WHERE r.id = :id")
                    .setParameter("id", targetId)
                    .executeUpdate();
        }
    }
}
