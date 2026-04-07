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
    private String id;
    private String nickname;
    private String email;

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
        // 🛡️ 방어적 복사(Defensive Copy): 원본 불변 맵을 수정하지 않기 위해 새 맵 생성
        Map<String, Object> mutableAttributes = new HashMap<>(attributes);
        
        // 네이버는 "response"라는 키 안에 실제 정보가 들어있습니다.
        Map<String, Object> response = (Map<String, Object>) mutableAttributes.get("response");
        
        if (response == null) {
            throw new IllegalArgumentException("네이버 인증 응답(response)이 유효하지 않습니다.");
        }

        String id = (String) response.get("id");

        // 🛡️ 평탄화(Flatten): 가변형 속성 맵에 id를 추가하여 호환성 확보
        mutableAttributes.put("id", id);

        return OAuth2Attributes.builder()
                .attributes(mutableAttributes)
                .nameAttributeKey("id")
                .id(id)
                .email("user_" + id + "@ieum.com")
                .nickname("u_" + id)
                .build();
    }

    private static OAuth2Attributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> mutableAttributes = new HashMap<>(attributes);
        Object idValue = mutableAttributes.get("id");
        String id = String.valueOf(idValue);

        return OAuth2Attributes.builder()
                .attributes(mutableAttributes)
                .nameAttributeKey(userNameAttributeName)
                .id(id)
                .email("user_" + id + "@ieum.com")
                .nickname("u_" + id)
                .build();
    }
}
