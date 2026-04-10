package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.user.deletion.application.port.out.DeleteAuthTokenPort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeleteAuthTokenAdapter implements DeleteAuthTokenPort {

    @PersistenceContext
    private final EntityManager em;

    @Override
    @Transactional
    public void deleteAllTokens(Long userId) {
        log.info("[DeleteAuthTokenAdapter] 토큰 일괄 파기 시작 - userId: {}", userId);
        em.createNativeQuery("DELETE FROM refresh_tokens WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
        em.createNativeQuery("DELETE FROM fcm_tokens WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
    }
}
