package com.ieum.user.auth.application.port.out;

import com.ieum.user.auth.domain.User;
import java.util.Optional;

/**
 * 아웃바운드 인터페이스: 비즈니스 로직(서비스)에서 DB(어댑터)로부터 데이터를 조회할 때 사용하는 포트
 */
public interface LoadUserPort {
    Optional<User> loadUserByLoginId(String loginId);
    Optional<User> loadUserById(Long id);
    boolean existsByLoginId(String loginId);
}
