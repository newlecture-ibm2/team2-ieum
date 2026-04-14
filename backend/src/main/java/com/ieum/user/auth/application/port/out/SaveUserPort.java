package com.ieum.user.auth.application.port.out;

import com.ieum.user.auth.domain.User;

/**
 * 아웃바운드 인터페이스: 비즈니스 로직(서비스)에서 DB(어댑터)로 데이터를 저장 지시할 때 사용하는 포트
 */
public interface SaveUserPort {
    User saveUser(User user);
    void saveRefreshToken(Long userId, String token);
    void removeRefreshToken(Long userId);
    boolean validateRefreshToken(Long userId, String token);
}
