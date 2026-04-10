package com.ieum.user.notification.adapter.out.persistence;

import com.ieum.user.notification.adapter.out.persistence.entity.NotificationSettingJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationSettingJpaRepository extends JpaRepository<NotificationSettingJpaEntity, Long> {

    Optional<NotificationSettingJpaEntity> findByUserId(Long userId);
}
