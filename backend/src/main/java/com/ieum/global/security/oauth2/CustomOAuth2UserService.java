package com.ieum.global.security.oauth2;

import com.ieum.user.auth.application.port.out.LoadUserPort;
import com.ieum.user.auth.application.port.out.SaveUserPort;
import com.ieum.user.auth.domain.Role;
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
import java.util.Map;
import java.util.Optional;

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
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().getKey())),
                attributes.getAttributes(),
                attributes.getNameAttributeKey()
        );
    }

    private User saveOrUpdate(OAuth2Attributes attributes) {
        String socialId = attributes.getId();

        if (socialId == null) {
            log.error(">>> [OAuth2 Login] FAILED: socialId is null. Attributes: {}", attributes.getAttributes());
            throw new OAuth2AuthenticationException("소셜 로그인 ID를 가져올 수 없습니다.");
        }

        log.info(">>> [OAuth2 Attributes] Provider ID: {}", socialId);

        // 가상 아이디 및 닉네임 생성 (예: user_12345)
        String virtualId = String.valueOf(socialId);
        String virtualLoginId = "user_" + virtualId;
        
        // 닉네임 중복 방지: 'u_' + ID (최대 20자 제한)
        String suffix = virtualId.length() > 18 ? virtualId.substring(virtualId.length() - 18) : virtualId;
        String virtualNickname = "u_" + suffix;

        log.info(">>> [OAuth2 Login] Props - ID: {}, Nickname: {}", virtualLoginId, virtualNickname);

        Optional<User> optionalUser = loadUserPort.loadUserByLoginId(virtualLoginId);

        if (optionalUser.isPresent()) {
            log.info(">>> [OAuth2 Login] Existing user found: {}", virtualLoginId);
            return optionalUser.get();
        }

        log.info(">>> [OAuth2 Login] Registering NEW user: {}", virtualLoginId);
        
        // 새 회원 가입 처리 (가상 데이터 사용 / DB NOT NULL 제약 통과를 위해 무작위 비번 주입)
        User newUser = new User(
                null,
                virtualLoginId,
                java.util.UUID.randomUUID().toString(),
                virtualNickname,
                "",
                Role.USER,
                false
        );

        return saveUserPort.saveUser(newUser);
    }
}
