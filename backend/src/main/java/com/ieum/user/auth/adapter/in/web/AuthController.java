package com.ieum.user.auth.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.global.security.CurrentUserId;
import com.ieum.user.auth.adapter.in.web.dto.AuthReq;
import com.ieum.user.auth.adapter.in.web.dto.AuthRes;
import com.ieum.user.auth.application.port.in.AuthUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증", description = "회원가입 / 로그인 / 토큰 갱신")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;

    @Operation(summary = "회원가입", description = "아이디, 비밀번호, 닉네임으로 회원가입합니다.")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody AuthReq.Register request) {
        authUseCase.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success());
    }

    @Operation(summary = "로그인", description = "아이디/비밀번호로 로그인 후 JWT 토큰을 발급합니다.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthRes.TokenDto>> login(@RequestBody AuthReq.Login request) {
        AuthRes.TokenDto tokenDto = authUseCase.login(request);
        return ResponseEntity.ok(ApiResponse.success(tokenDto));
    }

    @Operation(summary = "토큰 재발급", description = "RefreshToken을 통해 새로운 토큰을 발급받습니다.")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthRes.TokenDto>> refresh(@RequestBody AuthReq.Refresh request) {
        AuthRes.TokenDto tokenDto = authUseCase.refresh(request);
        return ResponseEntity.ok(ApiResponse.success(tokenDto));
    }

    @Operation(summary = "로그아웃", description = "클라이언트 세션을 무효화합니다.")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "비밀번호 찾기 - 질문 요청", description = "입력한 아이디로 해당 사용자의 보안 질문을 조회합니다.")
    @PostMapping("/password-recovery/request")
    public ResponseEntity<ApiResponse<AuthRes.PasswordRecoveryQuestion>> requestPasswordRecovery(@RequestBody AuthReq.PasswordRecoveryRequest request) {
        AuthRes.PasswordRecoveryQuestion question = authUseCase.requestRecovery(request);
        return ResponseEntity.ok(ApiResponse.success(question));
    }

    @Operation(summary = "비밀번호 찾기 - 답변 검증", description = "아이디와 매칭되는 보안 질문의 답변을 검증합니다.")
    @PostMapping("/password-recovery/verify")
    public ResponseEntity<ApiResponse<Void>> verifyPasswordRecoveryAnswer(@RequestBody AuthReq.PasswordRecoveryVerify request) {
        authUseCase.verifyAnswer(request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "비밀번호 찾기 - 비밀번호 재설정", description = "인증 완료 후 아이디 기준으로 새로운 비밀번호로 변경합니다.")
    @PostMapping("/password-recovery/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody AuthReq.PasswordReset request) {
        authUseCase.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "회원 탈퇴", description = "비밀번호 확인 후 30일간의 유예 기간을 두고 계정을 탈퇴(Soft Delete) 처리합니다.")
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @CurrentUserId Long userId,
            @RequestBody AuthReq.Withdraw request) {
        authUseCase.withdraw(userId, request.getPassword());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "세션 정보 조회", description = "현재 로그인된 사용자의 세션 및 간이 프로필 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthRes.SessionDto>> getMySession(
            @CurrentUserId Long userId) {
        AuthRes.SessionDto sessionDto = authUseCase.getMySession(userId);
        return ResponseEntity.ok(ApiResponse.success(sessionDto));
    }
}
