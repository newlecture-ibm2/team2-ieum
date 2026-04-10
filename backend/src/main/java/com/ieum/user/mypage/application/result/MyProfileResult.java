package com.ieum.user.mypage.application.result;

import com.ieum.user.auth.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * [v18-0] 마이페이지 프로필 상세 정보 결과 (Application Result)
 * - Festival 도메인의 Result 패턴(불변성, 정적 팩토리 메서드) 준수
 */
@Getter
@AllArgsConstructor
public class MyProfileResult {

    private final String nickname;
    private final String profileImageUrl;

    /**
     * 도메인 모델(User)로부터 결과 객체를 생성하는 정적 팩토리 메서드
     */
    public static MyProfileResult from(User user) {
        return new MyProfileResult(
                user.getNickname(),
                user.getProfileImage()
        );
    }
}
