package com.ieum.user.mypage.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * [v18-Sync] 프로필 수정 결과 (Application Result)
 * - 닉네임 변경 시 새로 발급된 JWT 토큰을 포함하여 반환합니다.
 */
@Getter
@Builder
@AllArgsConstructor
public class ProfileUpdateResult {
    private final String updatedAt;
    private final String newToken;   // 닉네임 변경 시에만 발급 (null이면 미변경)
    private final String nickname;   // 변경된 닉네임 (null이면 미변경)
}
