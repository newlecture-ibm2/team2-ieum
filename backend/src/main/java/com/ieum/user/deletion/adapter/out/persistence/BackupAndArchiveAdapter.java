package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.user.deletion.application.port.out.BackupAndArchivePort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class BackupAndArchiveAdapter implements BackupAndArchivePort {

    @PersistenceContext
    private final EntityManager em;

    @Override
    @Transactional
    public void archiveAndRemoveInquiries(Long userId) {
        em.createNativeQuery(
            "INSERT INTO inquiry_history (original_id, user_id, title, content, status, answer, answered_at, answered_by, created_at, deleted_reason, deleted_at) " +
            "SELECT id, user_id, title, content, CAST(status AS VARCHAR), answer, answered_at, answered_by, created_at, 'USER_HARD_DELETE', CURRENT_TIMESTAMP " +
            "FROM inquiries " +
            "WHERE user_id = :userId " +
            "AND id NOT IN (SELECT original_id FROM inquiry_history WHERE user_id = :userId)"
        ).setParameter("userId", userId).executeUpdate();

        em.createNativeQuery("DELETE FROM inquiries WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
    }

    @Override
    @Transactional
    public void archiveAndRemoveReports(Long userId) {
        em.createNativeQuery(
            "INSERT INTO report_history (original_id, reporter_id, target_type, target_id, reason, description, status, action, admin_note, processed_at, created_at, deleted_reason, deleted_at) " +
            "SELECT id, reporter_id, CAST(target_type AS VARCHAR), target_id, CAST(reason AS VARCHAR), description, CAST(status AS VARCHAR), CAST(action AS VARCHAR), admin_note, processed_at, created_at, 'USER_HARD_DELETE', CURRENT_TIMESTAMP " +
            "FROM reports " +
            "WHERE reporter_id = :userId " +
            "AND id NOT IN (SELECT original_id FROM report_history WHERE reporter_id = :userId)"
        ).setParameter("userId", userId).executeUpdate();

        em.createNativeQuery("DELETE FROM reports WHERE reporter_id = :userId").setParameter("userId", userId).executeUpdate();
    }
}
