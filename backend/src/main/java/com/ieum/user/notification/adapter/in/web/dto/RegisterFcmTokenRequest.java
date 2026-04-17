package com.ieum.user.notification.adapter.in.web.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * FCM 디바이스 토큰 등록 요청 DTO (API_USR_0050)
 */
@Getter
@NoArgsConstructor
public class RegisterFcmTokenRequest {

    /** FCM 디바이스 토큰 */
    private String token;
}
