package com.ieum.user.auth.adapter.out.persistence.repository;

import com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserJpaEntity, Long> {
    Optional<UserJpaEntity> findByLoginId(String loginId);
    
    // 조원분들의 기존 코드(ReviewService 등)와의 호환성을 위해 추가
    @org.springframework.data.jpa.repository.Query("SELECT u FROM UserJpaEntity u WHERE u.loginId = :email")
    Optional<UserJpaEntity> findByEmail(@org.springframework.data.repository.query.Param("email") String email);

    boolean existsByLoginId(String loginId);
    boolean existsByNickname(String nickname);
}
