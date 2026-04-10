package com.ieum.global.security.oauth2;

import com.ieum.user.auth.application.port.out.LoadUserPort;
import com.ieum.user.auth.application.port.out.SaveUserPort;
import com.ieum.user.auth.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        log.info(">>> [OAuth2 Client] registrationId: {}, userNameAttributeName: {}", registrationId, userNameAttributeName);

        OAuth2Attributes attributes = OAuth2Attributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        User user = saveOrUpdate(attributes);

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRole())),
                attributes.getAttributes(),
                attributes.getNameAttributeKey()
        );
    }

    private User saveOrUpdate(OAuth2Attributes attributes) {
        String loginId = attributes.getLoginId();

        if (loginId == null) {
            log.error(">>> [OAuth2 Login] FAILED: loginId is null. Attributes: {}", attributes.getAttributes());
            throw new OAuth2AuthenticationException("소셜 로그인 식별자를 가져올 수 없습니다.");
        }

        log.info(">>> [OAuth2 Attributes] LoginID: {}", loginId);

        Optional<User> optionalUser = loadUserPort.loadByLoginId(loginId);

        if (optionalUser.isPresent()) {
            log.info(">>> [OAuth2 Login] Existing user found: {}", loginId);
            return optionalUser.get();
        }

        log.info(">>> [OAuth2 Login] Registering NEW social user: {}", loginId);
        
        // 새 회원 가입 처리 (설계도 필수 스펙 준수)
        User newUser = User.builder()
                .loginId(loginId)
                .password(UUID.randomUUID().toString()) // 소셜 유저는 비번 사용 안 함 (NOT NULL 충족용 난수)
                .name(attributes.getName())
                .nickname(attributes.getNickname())
                .profileImage(attributes.getProfileImage())
                .role("USER")
                .termsAgreed(true) // 소셜 로그인은 기본적으로 제공처에서 동의됨
                .status("ACTIVE")
                .build();

        return saveUserPort.saveUser(newUser);
    }
}
