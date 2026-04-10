package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.user.deletion.application.port.out.DeleteUserReviewPort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeleteUserReviewAdapter implements DeleteUserReviewPort {

    @PersistenceContext
    private final EntityManager em;

    @Override
    @Transactional
    public void deleteReviewsAndRecalculateStats(Long userId) {
        @SuppressWarnings("unchecked")
        List<Number> reviewIds = em.createNativeQuery("SELECT id FROM reviews WHERE user_id = :userId")
                .setParameter("userId", userId).getResultList();

        @SuppressWarnings("unchecked")
        List<Number> festivalIds = em.createNativeQuery("SELECT DISTINCT festival_id FROM reviews WHERE user_id = :userId")
                .setParameter("userId", userId).getResultList();

        if (festivalIds.isEmpty()) return;

        int chunkSize = 1000;
        
        // 고아 Report 파기
        for (int i = 0; i < reviewIds.size(); i += chunkSize) {
            List<Number> chunk = reviewIds.subList(i, Math.min(i + chunkSize, reviewIds.size()));
            em.createNativeQuery("DELETE FROM reports WHERE target_type = 'REVIEW' AND target_id IN :chunk").setParameter("chunk", chunk).executeUpdate();
        }

        // 리뷰 삭제
        em.createNativeQuery("DELETE FROM reviews WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();

        // 축제 통계 갱신
        for (int i = 0; i < festivalIds.size(); i += chunkSize) {
            List<Number> chunk = festivalIds.subList(i, Math.min(i + chunkSize, festivalIds.size()));
            em.createNativeQuery(
                "UPDATE festivals f " +
                "SET review_count = (SELECT COUNT(id) FROM reviews r WHERE r.festival_id = f.id), " +
                "    avg_rating = COALESCE((SELECT AVG(CAST(rating AS FLOAT)) FROM reviews r WHERE r.festival_id = f.id), 0.0) " +
                "WHERE f.id IN (:chunk)"
            ).setParameter("chunk", chunk).executeUpdate();
        }
    }
}
