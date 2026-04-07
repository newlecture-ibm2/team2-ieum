package com.ieum.global.security.oauth2;

import com.ieum.global.security.JwtProvider;
import com.ieum.user.auth.application.port.out.LoadUserPort;
import com.ieum.user.auth.application.port.out.SaveUserPort;
import com.ieum.user.auth.domain.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;

    // TODO: 운영 환경에서는 별도 환경변수로 분리 권장
    @Value("${NEXT_PUBLIC_FRONTEND_URL:http://localhost:3333}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // 🔍 CustomOAuth2UserService와 동일한 가상 아이디 생성 로직 적용
        // oAuth2User.getName()은 CustomOAuth2UserService에서 설정한 'id' 속성값을 반환합니다.
        String virtualId = oAuth2User.getName();
        String virtualLoginId = "user_" + virtualId;

        User user = loadUserPort.loadUserByLoginId(virtualLoginId)
                .orElseThrow(() -> new IllegalArgumentException("가입된 유저를 찾을 수 없습니다. (ID: " + virtualLoginId + ")"));

        // 토큰 발급 (loginId 기반으로 전환)
        String accessToken = jwtProvider.generateAccessToken(user.getId(), user.getNickname(), user.getRole().getKey());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        // Refresh Token DB 저장
        saveUserPort.saveRefreshToken(user.getId(), refreshToken);
        
        // 프론트엔드의 콜백 라우트로 리다이렉트 (쿼리 파라미터로 토큰 전달)
        String targetUrl = frontendUrl + "/api/auth/oauth-callback" +
                "?accessToken=" + accessToken +
                "&refreshToken=" + refreshToken +
                "&expiresIn=" + jwtProvider.getExpirationSeconds();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
