package com.ieum.user.auth.adapter.out.persistence;

import com.ieum.user.auth.adapter.out.persistence.entity.RefreshTokenJpaEntity;
import com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity;
import com.ieum.user.auth.adapter.out.persistence.repository.RefreshTokenJpaRepository;
import com.ieum.user.auth.adapter.out.persistence.repository.UserJpaRepository;
import com.ieum.user.auth.application.port.out.LoadUserPort;
import com.ieum.user.auth.application.port.out.SaveUserPort;
import com.ieum.user.auth.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements LoadUserPort, SaveUserPort {

    private final UserJpaRepository userRepository;
    private final RefreshTokenJpaRepository refreshTokenRepository;

    @Override
    public Optional<User> loadUserByLoginId(String loginId) {
        return userRepository.findByLoginId(loginId).map(UserJpaEntity::toDomain);
    }

    @Override
    public Optional<User> loadUserById(Long id) {
        return userRepository.findById(id).map(UserJpaEntity::toDomain);
    }

    @Override
    public boolean existsByLoginId(String loginId) {
        return userRepository.existsByLoginId(loginId);
    }

    @Override
    public User saveUser(User user) {
        UserJpaEntity entity = UserJpaEntity.fromDomain(user);
        UserJpaEntity savedEntity = userRepository.save(entity);
        return savedEntity.toDomain();
    }

    @Override
    public void saveRefreshToken(Long userId, String token) {
        RefreshTokenJpaEntity tokenEntity = refreshTokenRepository.findById(userId)
                .orElse(new RefreshTokenJpaEntity(userId, token));
        tokenEntity.updateToken(token);
        refreshTokenRepository.save(tokenEntity);
    }

    @Override
    public void removeRefreshToken(Long userId) {
        refreshTokenRepository.deleteById(userId);
    }

    @Override
    public boolean validateRefreshToken(Long userId, String token) {
        return refreshTokenRepository.findById(userId)
                .map(entity -> entity.getToken().equals(token))
                .orElse(false);
    }
}
