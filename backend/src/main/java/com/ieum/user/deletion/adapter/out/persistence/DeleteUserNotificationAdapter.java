package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.user.deletion.application.port.out.DeleteUserNotificationPort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeleteUserNotificationAdapter implements DeleteUserNotificationPort {

    @PersistenceContext
    private final EntityManager em;

    @Override
    @Transactional
    public void deleteSettingsAndNotifications(Long userId) {
        log.info("[DeleteUserNotificationAdapter] 알림 데이터 파기 시작 - userId: {}", userId);
        em.createNativeQuery("DELETE FROM notifications WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
        // notification_settings 테이블이 존재하지 않을 경우 오류 방지를 위한 방어 코드
        try {
            em.createNativeQuery("DELETE FROM notification_settings WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
        } catch(Exception ignored) {}
    }
}
