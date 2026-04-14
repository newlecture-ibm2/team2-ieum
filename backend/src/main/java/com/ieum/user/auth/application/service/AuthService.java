package com.ieum.user.auth.application.service;

import com.ieum.global.security.JwtProvider;
import com.ieum.user.auth.adapter.in.web.dto.AuthReq;
import com.ieum.user.auth.adapter.in.web.dto.AuthRes;
import com.ieum.user.auth.application.port.in.AuthUseCase;
import com.ieum.user.auth.application.port.in.CheckUserSuspensionUseCase;
import com.ieum.user.auth.application.port.out.LoadUserPort;
import com.ieum.user.auth.application.port.out.SaveUserPort;
import com.ieum.user.auth.domain.User;
import com.ieum.global.common.enums.UserStatus;
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
public class AuthService implements AuthUseCase, CheckUserSuspensionUseCase {

    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    // TODO: 실무에서는 Redis/DB 사용 권장 (현재는 임시 메모리 저장)
    private final Map<String, Boolean> verifiedIds = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public AuthRes.TokenDto login(AuthReq.Login request) {
        User user = loadUserPort.loadByLoginId(request.getId())
                .orElseThrow(() -> new BadCredentialsException("존재하지 않는 아이디입니다."));

        // 🛡️ 탈퇴 유예 정책 체크
        String successMessage = null;
        if (UserStatus.WITHDRAWAL.name().equals(user.getStatus())) {
            if (user.isWithdrawalExpired()) {
                throw new BadCredentialsException("존재하지 않는 아이디입니다.");
            }
            // 30일 이내라면 자동 복구
            user = user.reactivate();
            saveUserPort.saveUser(user);
            successMessage = "탈퇴 유예 기간 내에 접속하여 계정이 성공적으로 복구되었습니다.";
        }

        if (!user.checkPassword(request.getPassword(), passwordEncoder)) {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtProvider.generateAccessToken(user.getUserId(), user.getNickname(), user.getRole());
        String refreshToken = jwtProvider.generateRefreshToken(user.getUserId());

        saveUserPort.saveRefreshToken(user.getUserId(), refreshToken);

        return AuthRes.TokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtProvider.getExpirationSeconds())
                .message(successMessage)
                .user(AuthRes.UserDto.from(user))
                .build();
    }

    @Override
    @Transactional
    public void withdraw(Long userId, String password) {
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!user.checkPassword(password, passwordEncoder)) {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }

        // 도메인 로직을 통한 탈퇴 상태 변경 및 저장
        User withdrawnUser = user.withdraw();
        saveUserPort.saveUser(withdrawnUser);

        // 연관 데이터 처리 (리프레시 토큰 무효화 등)
        saveUserPort.removeRefreshToken(userId);
    }

    @Override
    @Transactional
    public void register(AuthReq.Register request) {
        if (loadUserPort.existsByLoginId(request.getId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // 📱 전화번호 정규화 (숫자만 추출) 및 중복 체크
        String normalizedPhone = (request.getPhone() != null) 
                ? request.getPhone().replaceAll("[^0-9]", "") 
                : null;

        // 🔍 name이 비어있으면 nickname을 대신 사용 (DB NOT NULL 제약조건 대응)
        String realName = (request.getName() == null || request.getName().isBlank()) ? request.getNickname() : request.getName();

        User newUser = User.builder()
                .loginId(request.getId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(realName)
                .nickname(request.getNickname())
                .phone(normalizedPhone)
                .role("USER")
                .termsAgreed(request.isTermsAgreed())
                .securityQuestion(request.getSecurityQuestion())
                .securityAnswer(request.getSecurityAnswer())
                .status("ACTIVE")
                .build();

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

        if (!saveUserPort.validateRefreshToken(user.getUserId(), tokenString)) {
            throw new IllegalArgumentException("DB에 존재하지 않거나 일치하지 않는 Refresh Token입니다.");
        }

        String newAccessToken = jwtProvider.generateAccessToken(user.getUserId(), user.getNickname(), user.getRole());
        String newRefreshToken = jwtProvider.generateRefreshToken(user.getUserId());

        saveUserPort.saveRefreshToken(user.getUserId(), newRefreshToken);

        return AuthRes.TokenDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtProvider.getExpirationSeconds())
                .user(AuthRes.UserDto.from(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthRes.PasswordRecoveryQuestion requestRecovery(AuthReq.PasswordRecoveryRequest request) {
        String loginId = request.getId();

        User user = loadUserPort.loadByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("가입 정보가 일치하지 않습니다."));

        if (user.getSecurityQuestion() == null || user.getSecurityQuestion().isBlank()) {
            throw new IllegalArgumentException("등록된 보안 질문이 없습니다. 관리자에게 문의하세요.");
        }

        return AuthRes.PasswordRecoveryQuestion.builder()
                .question(user.getSecurityQuestion())
                .build();
    }

    @Override
    public void verifyAnswer(AuthReq.PasswordRecoveryVerify request) {
        String loginId = request.getId();
        String inputAnswer = request.getAnswer();

        User user = loadUserPort.loadByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (inputAnswer == null || user.getSecurityAnswer() == null) {
            throw new IllegalArgumentException("답변 정보가 올바르지 않습니다.");
        }

        // 🛡️ 공백 무시 비교 (사용자 편의성)
        String normalizedInput = inputAnswer.replaceAll("\\s+", "");
        String normalizedDB = user.getSecurityAnswer().replaceAll("\\s+", "");

        if (!normalizedInput.equals(normalizedDB)) {
            throw new IllegalArgumentException("답변이 일치하지 않습니다.");
        }

        verifiedIds.put(loginId, true); // 인증 완료 표시
    }

    @Override
    @Transactional
    public void resetPassword(AuthReq.PasswordReset request) {
        String loginId = request.getId();
        
        if (!verifiedIds.getOrDefault(loginId, false)) {
            throw new IllegalArgumentException("본인 인증이 완료되지 않았습니다.");
        }

        User user = loadUserPort.loadByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        User updatedUser = User.builder()
                .userId(user.getUserId())
                .loginId(user.getLoginId())
                .password(passwordEncoder.encode(request.getNewPassword()))
                .name(user.getName())
                .nickname(user.getNickname())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .termsAgreed(user.isTermsAgreed())
                .securityQuestion(user.getSecurityQuestion())
                .securityAnswer(user.getSecurityAnswer())
                .status(user.getStatus())
                .build();

        saveUserPort.saveUser(updatedUser);

        verifiedIds.remove(loginId); // 재설정 완료 후 상태 제거
    }

    @Override
    @Transactional(readOnly = true)
    public AuthRes.UserDto getMyProfile(Long userId) {
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return AuthRes.UserDto.from(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthRes.SessionDto getMySession(Long userId) {
        if (userId == null) {
            return AuthRes.SessionDto.builder()
                    .isLoggedIn(false)
                    .build();
        }

        return loadUserPort.loadUserById(userId)
                .map(user -> AuthRes.SessionDto.builder()
                        .isLoggedIn(true)
                        .user(AuthRes.UserInfoDto.builder()
                                .nickname(user.getNickname())
                                .role(user.getRole())
                                .profileImage(user.getProfileImage())
                                .build())
                        .build())
                .orElseGet(() -> AuthRes.SessionDto.builder()
                        .isLoggedIn(false)
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSuspended(Long userId) {
        if (userId == null) {
            return false;
        }
        return loadUserPort.loadUserById(userId)
                .map(User::isSuspended)
                .orElse(false);
    }
}
