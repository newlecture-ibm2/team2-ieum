package com.ieum.user.favorite.adapter.out.persistence;

import com.ieum.user.auth.adapter.out.persistence.repository.UserJpaRepository;
import com.ieum.user.favorite.application.port.out.LoadFavoriteUserPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LoadFavoriteUserAdapter implements LoadFavoriteUserPort {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Long resolveUserId(String loginId) {
        return userJpaRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."))
                .getUserId();
    }
}
