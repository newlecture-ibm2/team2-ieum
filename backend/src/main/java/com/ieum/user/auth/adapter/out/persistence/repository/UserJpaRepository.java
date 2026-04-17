package com.ieum.user.auth.adapter.out.persistence.repository;

import com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserJpaEntity, Long> {
    Optional<UserJpaEntity> findByLoginId(String loginId);
    Optional<UserJpaEntity> findByNickname(String nickname);
    boolean existsByLoginId(String loginId);
    boolean existsByNickname(String nickname);
    boolean existsByPhone(String phone);
}
