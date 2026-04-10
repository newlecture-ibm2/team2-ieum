package com.ieum.user.notification.adapter.out.persistence;

import com.ieum.user.notification.adapter.out.persistence.entity.FcmTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FcmTokenJpaRepository extends JpaRepository<FcmTokenJpaEntity, Long> {

    Optional<FcmTokenJpaEntity> findByUserIdAndToken(Long userId, String token);

    List<FcmTokenJpaEntity> findByUserId(Long userId);
}

