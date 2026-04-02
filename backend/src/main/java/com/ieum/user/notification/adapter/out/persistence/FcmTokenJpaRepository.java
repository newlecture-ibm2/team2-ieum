package com.ieum.user.notification.adapter.out.persistence;

import com.ieum.user.notification.domain.model.FcmToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FcmTokenJpaRepository extends JpaRepository<FcmToken, Long> {

    Optional<FcmToken> findByUserIdAndToken(Long userId, String token);
}
