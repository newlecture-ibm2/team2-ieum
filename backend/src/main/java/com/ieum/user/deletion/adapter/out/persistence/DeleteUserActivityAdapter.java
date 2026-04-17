package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.user.deletion.application.port.out.DeleteUserActivityPort;
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
public class DeleteUserActivityAdapter implements DeleteUserActivityPort {

    @PersistenceContext
    private final EntityManager em;

    @Override
    @Transactional
    public void deleteFavorites(Long userId) {
        em.createNativeQuery("DELETE FROM favorites WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
    }

    @Override
    @Transactional
    public void deleteLikesAndSyncCount(Long userId) {
        @SuppressWarnings("unchecked")
        List<Number> likedPostIds = em.createNativeQuery("SELECT post_id FROM post_likes WHERE user_id = :userId")
                .setParameter("userId", userId).getResultList();

        if (likedPostIds.isEmpty()) return;

        int chunkSize = 1000;
        for (int i = 0; i < likedPostIds.size(); i += chunkSize) {
            List<Number> chunk = likedPostIds.subList(i, Math.min(i + chunkSize, likedPostIds.size()));
            em.createNativeQuery("UPDATE posts SET like_count = like_count - 1 WHERE id IN (:chunk) AND like_count > 0")
              .setParameter("chunk", chunk).executeUpdate();
        }
        em.createNativeQuery("DELETE FROM post_likes WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
    }
}
