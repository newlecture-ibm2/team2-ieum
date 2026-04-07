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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthUseCase {

    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    // TODO: 실무에서는 Redis/DB 사용 권장 (현재는 임시 메모리 저장)
    private final Map<String, String> recoveryCodes = new ConcurrentHashMap<>();
    private final Map<String, Boolean> verifiedEmails = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public AuthRes.TokenDto login(AuthReq.Login request) {
        User user = loadUserPort.loadUserByLoginId(request.getId())
                .orElseThrow(() -> new BadCredentialsException("아이디 또는 비밀번호가 일치하지 않습니다."));

        if (!user.checkPassword(request.getPassword(), passwordEncoder)) {
            throw new BadCredentialsException("아이디 또는 비밀번호가 일치하지 않습니다.");
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
        if (loadUserPort.existsByLoginId(request.getId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        User newUser = new User(
                null,
                request.getId(),
                passwordEncoder.encode(request.getPassword()),
                request.getNickname(),
                request.getPhone(),
                Role.USER,
                request.isMarketingAgreed()
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

    @Override
    @Transactional
    public void requestRecovery(AuthReq.PasswordRecoveryRequest request) {
        String loginId = request.getId();
        if (!loadUserPort.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("가입되지 않은 아이디입니다.");
        }

        // 6자리 난수 생성
        String code = String.format("%06d", new Random().nextInt(1000000));
        recoveryCodes.put(loginId, code);
        verifiedEmails.put(loginId, false);

        // TODO: 실제 이메일 발송 로직 연동 (현재는 로그 출력으로 대체)
        System.out.println("================================");
        System.out.println("[PASSWORD RECOVERY] ID: " + loginId);
        System.out.println("[PASSWORD RECOVERY] Code: " + code);
        System.out.println("================================");
    }

    @Override
    public void verifyCode(AuthReq.PasswordRecoveryVerify request) {
        String loginId = request.getId();
        String code = request.getCode();

        if (!recoveryCodes.containsKey(loginId) || !recoveryCodes.get(loginId).equals(code)) {
            throw new IllegalArgumentException("인증 코드가 일치하지 않거나 만료되었습니다.");
        }

        recoveryCodes.remove(loginId); // 인증 성공 시 코드 제거
        verifiedEmails.put(loginId, true); // 인증 완료 표시
    }

    @Override
    @Transactional
    public void resetPassword(AuthReq.PasswordReset request) {
        String loginId = request.getId();
        
        if (!verifiedEmails.getOrDefault(loginId, false)) {
            throw new IllegalArgumentException("아이디 인증이 완료되지 않았습니다.");
        }

        User user = loadUserPort.loadUserByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        User updatedUser = user.withPassword(passwordEncoder.encode(request.getNewPassword()));
        saveUserPort.saveUser(updatedUser);

        verifiedEmails.remove(loginId); // 재설정 완료 후 상태 제거
    }

    @Override
    @Transactional(readOnly = true)
    public AuthRes.UserDto getMyProfile(String loginId) {
        User user = loadUserPort.loadUserByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return AuthRes.UserDto.from(user);
    }
}
