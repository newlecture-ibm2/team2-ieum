package com.ieum.user.auth.application.port.in;

import com.ieum.user.auth.adapter.in.web.dto.AuthReq;
import com.ieum.user.auth.adapter.in.web.dto.AuthRes;

/**
 * 인바운드 인터페이스: 외부(컨트롤러)에서 비즈니스 로직(서비스)으로 접근할 때 열어두는 포트
 */
public interface AuthUseCase {
    AuthRes.TokenDto login(AuthReq.Login request);
    void register(AuthReq.Register request);
    AuthRes.TokenDto refresh(AuthReq.Refresh request);

    /** 비밀번호 찾기 */
    AuthRes.PasswordRecoveryQuestion requestRecovery(AuthReq.PasswordRecoveryRequest request);
    void verifyAnswer(AuthReq.PasswordRecoveryVerify request);
    void resetPassword(AuthReq.PasswordReset request);

    /** 내 정보 조회 */
    AuthRes.UserDto getMyProfile(Long userId);

    /** 세션 정보 조회 */
    AuthRes.SessionDto getMySession(Long userId);

    /** 회원 탈퇴 */
    void withdraw(Long userId, String password);

    /** 닉네임 중복 체크 */
    boolean checkNicknameAvailability(String nickname);
}
