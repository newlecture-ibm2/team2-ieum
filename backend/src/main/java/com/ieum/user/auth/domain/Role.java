package com.ieum.user.auth.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * [Domain] 사용자 권한
 */
@Getter
@RequiredArgsConstructor
public enum Role {

    USER("ROLE_USER", "일반 사용자"),
    ADMIN("ROLE_ADMIN", "관리자");

    private final String key;
    private final String description;
}
