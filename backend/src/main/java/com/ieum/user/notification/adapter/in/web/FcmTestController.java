package com.ieum.user.notification.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.user.notification.application.service.FcmMessageSender;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "FCM 테스트", description = "푸시 알림 테스트용 API (개발 환경 전용)")
@RestController
@RequestMapping("/api/test/fcm")
@RequiredArgsConstructor
public class FcmTestController {

    private final FcmMessageSender fcmMessageSender;

    @Operation(summary = "단일 기기 푸시 발송 테스트", description = "FCM 토큰을 직접 입력하여 알림을 테스트합니다.")
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Void>> sendTestPush(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String title = request.getOrDefault("title", "테스트 알림");
        String body = request.getOrDefault("body", "이것은 테스트 메시지입니다.");

        fcmMessageSender.sendPush(token, title, body);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
