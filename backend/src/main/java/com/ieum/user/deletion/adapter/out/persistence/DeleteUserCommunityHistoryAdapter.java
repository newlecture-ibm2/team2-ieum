package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.user.deletion.application.port.out.DeleteUserCommunityHistoryPort;
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
public class DeleteUserCommunityHistoryAdapter implements DeleteUserCommunityHistoryPort {

    @PersistenceContext
    private final EntityManager em;

    @Override
    @Transactional
    public void deleteCommentsAndSyncCount(Long userId) {
        List<Long> commentIds = em.createQuery("SELECT c.id FROM CommentEntity c WHERE c.userId = :userId", Long.class)
                .setParameter("userId", userId).getResultList();

        if (commentIds.isEmpty()) return;
        
        int chunkSize = 1000;
        for (int i = 0; i < commentIds.size(); i += chunkSize) {
            List<Long> chunk = commentIds.subList(i, Math.min(i + chunkSize, commentIds.size()));
            em.createQuery("UPDATE CommentEntity c SET c.parent = null WHERE c.parent.id IN :chunk").setParameter("chunk", chunk).executeUpdate();
            em.createNativeQuery("DELETE FROM reports WHERE target_type = 'COMMENT' AND target_id IN :chunk").setParameter("chunk", chunk).executeUpdate();
            em.createQuery("DELETE FROM CommentEntity c WHERE c.id IN :chunk").setParameter("chunk", chunk).executeUpdate();
        }
    }

    @Override
    @Transactional
    public void deletePostsAndChildEntities(Long userId) {
        List<Long> postIds = em.createQuery("SELECT p.id FROM PostEntity p WHERE p.authorId = :userId", Long.class)
                .setParameter("userId", userId).getResultList();

        if (postIds.isEmpty()) return;

        int chunkSize = 1000;
        for (int i = 0; i < postIds.size(); i += chunkSize) {
            List<Long> chunk = postIds.subList(i, Math.min(i + chunkSize, postIds.size()));

            em.createNativeQuery("DELETE FROM reports WHERE target_type = 'POST' AND target_id IN :chunk").setParameter("chunk", chunk).executeUpdate();
            try {
                em.createNativeQuery("DELETE FROM reports WHERE target_type = 'COMMENT' AND target_id IN (SELECT comment_id FROM comments WHERE post_id IN :chunk)").setParameter("chunk", chunk).executeUpdate();
            } catch (Exception ignored) {} // Some schema mismatch fallback
            
            em.createQuery("DELETE FROM CommentEntity c WHERE c.postId IN :chunk").setParameter("chunk", chunk).executeUpdate();
            em.createQuery("DELETE FROM PostLikeEntity pl WHERE pl.postId IN :chunk").setParameter("chunk", chunk).executeUpdate();
            em.createQuery("DELETE FROM PostEntity p WHERE p.id IN :chunk").setParameter("chunk", chunk).executeUpdate();
        }
    }
}
