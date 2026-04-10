package com.ieum.user.mypage.application.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * [v18-0] 프로필 수정 결과 (Application Result)
 * - 수정 완료 후 갱신 시각 등의 정보를 포함
 */
@Getter
@AllArgsConstructor
public class ProfileUpdateResult {
    private final String updatedAt;
}
