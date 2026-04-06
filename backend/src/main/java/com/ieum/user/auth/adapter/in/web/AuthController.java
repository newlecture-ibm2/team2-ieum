package com.ieum.user.auth.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.user.auth.adapter.in.web.dto.AuthReq;
import com.ieum.user.auth.adapter.in.web.dto.AuthRes;
import com.ieum.user.auth.application.port.in.AuthUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증", description = "회원가입 / 로그인 / 토큰 갱신")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;

    @Operation(summary = "회원가입", description = "이메일, 비밀번호, 닉네임으로 회원가입합니다.")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@RequestBody AuthReq.Register request) {
        authUseCase.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success());
    }

    @Operation(summary = "로그인", description = "이메일/비밀번호로 로그인 후 JWT 토큰을 발급합니다.")
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
}
