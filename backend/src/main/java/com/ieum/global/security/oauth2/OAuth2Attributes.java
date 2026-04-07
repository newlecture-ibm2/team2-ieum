package com.ieum.global.security.oauth2;

import lombok.Builder;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
@Builder
public class OAuth2Attributes {
    private Map<String, Object> attributes;
    private String nameAttributeKey;
    private String socialId;
    private String nickname;
    private String loginId;
    private String name;
    private String profileImage;

    public static OAuth2Attributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        if ("kakao".equals(registrationId)) {
            return ofKakao(userNameAttributeName, attributes);
        }
        if ("naver".equals(registrationId)) {
            return ofNaver(userNameAttributeName, attributes);
        }
        return null;
    }

    private static OAuth2Attributes ofNaver(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> mutableAttributes = new HashMap<>(attributes);
        Map<String, Object> response = (Map<String, Object>) mutableAttributes.get("response");
        
        if (response == null) {
            throw new IllegalArgumentException("네이버 인증 응답(response)이 유효하지 않습니다.");
        }

        String id = (String) response.get("id");
        String loginId = "naver_" + id;
        String nickname = (String) response.get("nickname");
        String name = (String) response.get("name");
        String profileImage = (String) response.get("profile_image");

        mutableAttributes.put("id", id);
        mutableAttributes.put("loginId", loginId);

        return OAuth2Attributes.builder()
                .attributes(mutableAttributes)
                .nameAttributeKey("id")
                .socialId(id)
                .loginId(loginId)
                .nickname(nickname != null ? nickname : "u_" + id)
                .name(name != null ? name : "NaverUser")
                .profileImage(profileImage)
                .build();
    }

    private static OAuth2Attributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> mutableAttributes = new HashMap<>(attributes);
        Object idValue = mutableAttributes.get("id");
        String id = String.valueOf(idValue);

        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = kakaoAccount != null ? (Map<String, Object>) kakaoAccount.get("profile") : null;

        String loginId = "kakao_" + id;
        mutableAttributes.put("loginId", loginId);
        String nickname = profile != null ? (String) profile.get("nickname") : null;
        String profileImage = profile != null ? (String) profile.get("profile_image_url") : null;

        return OAuth2Attributes.builder()
                .attributes(mutableAttributes)
                .nameAttributeKey(userNameAttributeName)
                .socialId(id)
                .loginId(loginId)
                .nickname(nickname != null ? nickname : "u_" + id)
                .name("KakaoUser") // 카카오는 이름 권한이 따로 필요하므로 기본값 설정
                .profileImage(profileImage)
                .build();
    }
}
