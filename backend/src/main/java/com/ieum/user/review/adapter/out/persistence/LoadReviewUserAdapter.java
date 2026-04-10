package com.ieum.user.review.adapter.out.persistence;

import com.ieum.user.auth.adapter.out.persistence.repository.UserJpaRepository;
import com.ieum.user.review.application.port.out.LoadReviewUserPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 사용자 조회 어댑터 (Output Adapter)
 * - Review 모듈의 LoadReviewUserPort를 구현
 * - Auth 모듈의 UserJpaRepository에 대한 의존성을 여기(adapter 계층)에서만 갖음
 */
@Component
@RequiredArgsConstructor
public class LoadReviewUserAdapter implements LoadReviewUserPort {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Long resolveUserId(String loginId) {
        return userJpaRepository.findById(Long.valueOf(loginId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."))
                .getUserId();
    }
}
