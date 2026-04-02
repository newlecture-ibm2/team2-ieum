package com.ieum.user.notification.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.user.notification.application.port.in.GetMyNotificationsUseCase;
import com.ieum.user.notification.application.port.in.MarkNotificationsReadUseCase;
import com.ieum.user.notification.application.port.in.RegisterFcmTokenUseCase;
import com.ieum.user.notification.application.port.in.UpdateNotificationSettingUseCase;
import com.ieum.user.notification.domain.model.NotificationSetting;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 알림/FCM 전용 컨트롤러 (Input Adapter)
 * - 기존 UserController에서 분리
 * - 로직 없이 UseCase만 호출
 */
@Tag(name = "알림/FCM", description = "내 알림 조회, 읽음 처리, 알림 설정, FCM 토큰 등록")
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class NotificationController {

    private final GetMyNotificationsUseCase getMyNotificationsUseCase;
    private final RegisterFcmTokenUseCase registerFcmTokenUseCase;
    private final UpdateNotificationSettingUseCase updateNotificationSettingUseCase;
    private final MarkNotificationsReadUseCase markNotificationsReadUseCase;

    // TODO: 현재는 테스트를 위해 userId = 1L 로 고정합니다. (Security 도입 시 @AuthenticationPrincipal 같은 인증 객체로 변경)
    private final Long TEMP_USER_ID = 1L;

    /**
     * 내 알림 조회 (API_USR_0040)
     */
    @Operation(summary = "내 알림 목록", description = "나에게 온 알림 목록과 읽지 않은 알림 개수를 조회합니다.")
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyNotifications() {
        return ResponseEntity.ok(ApiResponse.success(
                getMyNotificationsUseCase.getMyNotifications(TEMP_USER_ID)));
    }

    /**
     * FCM 토큰 등록 (API_USR_0050)
     */
    @Operation(summary = "FCM 토큰 등록", description = "푸시 알림용 FCM 디바이스 토큰을 등록합니다.")
    @PostMapping("/fcm-token")
    public ResponseEntity<ApiResponse<Void>> registerFcmToken(
            @RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token != null && !token.isBlank()) {
            registerFcmTokenUseCase.register(TEMP_USER_ID, token);
        }
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * 알림 설정 변경 (API_USR_0060)
     */
    @Operation(summary = "알림 설정 변경", description = "푸시 수신 동의 여부 및 세부 알림 설정을 변경합니다.")
    @PatchMapping("/notifications/settings")
    public ResponseEntity<ApiResponse<NotificationSetting>> updateSettings(
            @RequestBody Map<String, Boolean> request) {
        NotificationSetting updated = updateNotificationSettingUseCase.updateSettings(
                TEMP_USER_ID,
                request.get("pushEnabled"),
                request.get("festivalStart"),
                request.get("festivalEnd"),
                request.get("notice"),
                request.get("comment")
        );
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /**
     * 알림 읽음 처리 (API_USR_0070)
     */
    @Operation(summary = "알림 읽음 처리", description = "특정 알림들 혹은 전체 알림을 읽음 처리합니다.")
    @PatchMapping("/notifications/read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAsRead(
            @RequestBody(required = false) Map<String, List<Long>> request) {
        List<Long> ids = (request != null) ? request.get("notificationIds") : null;
        int count = markNotificationsReadUseCase.markAsRead(TEMP_USER_ID, ids);
        return ResponseEntity.ok(ApiResponse.success(Map.of("updatedCount", count)));
    }
}
