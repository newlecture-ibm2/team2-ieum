package com.ieum.user.auth.application.service;

import com.ieum.global.security.JwtProvider;
import com.ieum.user.auth.adapter.in.web.dto.AuthReq;
import com.ieum.user.auth.adapter.in.web.dto.AuthRes;
import com.ieum.user.auth.application.port.in.AuthUseCase;
import com.ieum.user.auth.application.port.out.LoadUserPort;
import com.ieum.user.auth.application.port.out.SaveUserPort;
import com.ieum.user.auth.domain.Role;
import com.ieum.user.auth.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthUseCase {

    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Override
    @Transactional
    public AuthRes.TokenDto login(AuthReq.Login request) {
        User user = loadUserPort.loadUserByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다."));

        if (!user.checkPassword(request.getPassword(), passwordEncoder)) {
            throw new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtProvider.generateAccessToken(user.getId(), user.getNickname(), user.getRole().getKey());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        saveUserPort.saveRefreshToken(user.getId(), refreshToken);

        return AuthRes.TokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtProvider.getExpirationSeconds())
                .user(AuthRes.UserDto.from(user))
                .build();
    }

    @Override
    @Transactional
    public void register(AuthReq.Register request) {
        if (loadUserPort.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User newUser = new User(
                null,
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getNickname(),
                request.getPhone(),
                Role.USER
        );

        saveUserPort.saveUser(newUser);
    }

    @Override
    @Transactional
    public AuthRes.TokenDto refresh(AuthReq.Refresh request) {
        String tokenString = request.getRefreshToken();
        
        if (tokenString == null || !jwtProvider.validateToken(tokenString)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
        }
        
        String subjectId = jwtProvider.getSubjectFromToken(tokenString);
        Long userId;
        try {
            userId = Long.valueOf(subjectId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("유효하지 않은 토큰 정보입니다.");
        }
        
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!saveUserPort.validateRefreshToken(user.getId(), tokenString)) {
            throw new IllegalArgumentException("DB에 존재하지 않거나 일치하지 않는 Refresh Token입니다.");
        }

        String newAccessToken = jwtProvider.generateAccessToken(user.getId(), user.getNickname(), user.getRole().getKey());
        String newRefreshToken = jwtProvider.generateRefreshToken(user.getId());

        saveUserPort.saveRefreshToken(user.getId(), newRefreshToken);

        return AuthRes.TokenDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtProvider.getExpirationSeconds())
                .user(AuthRes.UserDto.from(user))
                .build();
    }
}
