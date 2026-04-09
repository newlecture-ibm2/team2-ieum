package com.ieum.community.adapter.out.persistence;

import com.ieum.community.application.port.out.UserSuspensionCheckPort;
import com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity;
import com.ieum.user.auth.adapter.out.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * [Adapter] 사용자 정지 상태 확인 어댑터
 * UserJpaRepository를 통해 사용자의 정지 상태를 확인합니다.
 */
@Component
@RequiredArgsConstructor
public class UserSuspensionCheckAdapter implements UserSuspensionCheckPort {

    private final UserJpaRepository userRepository;

    @Override
    public boolean isSuspended(Long userId) {
        if (userId == null) {
            return false;
        }
        return userRepository.findById(userId)
                .map(entity -> entity.toDomain().isSuspended())
                .orElse(false);
    }
}
