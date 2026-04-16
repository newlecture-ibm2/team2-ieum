package com.ieum.user.notification.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.global.security.CurrentUserId;
import com.ieum.user.notification.adapter.in.web.dto.MarkNotificationsReadRequest;
import com.ieum.user.notification.adapter.in.web.dto.NotificationListResponse;
import com.ieum.user.notification.adapter.in.web.dto.RegisterFcmTokenRequest;
import com.ieum.user.notification.adapter.in.web.dto.UpdateNotificationSettingRequest;
import com.ieum.user.notification.application.port.in.DeleteNotificationUseCase;
import com.ieum.user.notification.application.port.in.GetMyNotificationsUseCase;
import com.ieum.user.notification.application.port.in.MarkNotificationsReadUseCase;
import com.ieum.user.notification.application.port.in.RegisterFcmTokenUseCase;
import com.ieum.user.notification.application.port.in.UpdateNotificationSettingUseCase;
import com.ieum.user.notification.application.port.in.GetNotificationSettingsUseCase;
import com.ieum.user.notification.domain.model.NotificationSetting;
import io.swagger.v3.oas.annotations.Operation;
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
    private final GetNotificationSettingsUseCase getNotificationSettingsUseCase;
    private final MarkNotificationsReadUseCase markNotificationsReadUseCase;
    private final DeleteNotificationUseCase deleteNotificationUseCase;

    /**
     * 내 알림 조회 (API_USR_0040)
     */
    @Operation(summary = "내 알림 목록", description = "나에게 온 알림 목록과 읽지 않은 알림 개수를 조회합니다.")
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<NotificationListResponse>> getMyNotifications(
            @CurrentUserId Long userId) {
        if (userId == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(ApiResponse.success(
                getMyNotificationsUseCase.getMyNotifications(userId)));
    }

    /**
     * FCM 토큰 등록 (API_USR_0050)
     */
    @Operation(summary = "FCM 토큰 등록", description = "푸시 알림용 FCM 디바이스 토큰을 등록합니다.")
    @PostMapping("/fcm-token")
    public ResponseEntity<ApiResponse<Void>> registerFcmToken(
            @CurrentUserId Long userId,
            @RequestBody RegisterFcmTokenRequest request) {
        if (userId == null)
            return ResponseEntity.status(401).build();
        registerFcmTokenUseCase.register(userId, request.getToken());
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * 알림 설정 조회
     */
    @Operation(summary = "알림 설정 조회", description = "푸시 수신 동의 여부 및 세부 알림 설정을 조회합니다.")
    @GetMapping("/notifications/settings")
    public ResponseEntity<ApiResponse<NotificationSetting>> getSettings(
            @CurrentUserId Long userId) {
        if (userId == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(ApiResponse.success(getNotificationSettingsUseCase.getSettings(userId)));
    }

    /**
     * 알림 설정 변경 (API_USR_0060)
     */
    @Operation(summary = "알림 설정 변경", description = "푸시 수신 동의 여부 및 세부 알림 설정을 변경합니다.")
    @PatchMapping("/notifications/settings")
    public ResponseEntity<ApiResponse<NotificationSetting>> updateSettings(
            @CurrentUserId Long userId,
            @RequestBody UpdateNotificationSettingRequest request) {
        if (userId == null)
            return ResponseEntity.status(401).build();
        NotificationSetting updated = updateNotificationSettingUseCase.updateSettings(
                userId,
                request.getPushEnabled(),
                request.getFestivalStart(),
                request.getFestivalEnd(),
                request.getNotice(),
                request.getComment());
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /**
     * 알림 읽음 처리 (API_USR_0070)
     */
    @Operation(summary = "알림 읽음 처리", description = "특정 알림들 혹은 전체 알림을 읽음 처리합니다.")
    @PatchMapping("/notifications/read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAsRead(
            @CurrentUserId Long userId,
            @RequestBody(required = false) MarkNotificationsReadRequest request) {
        if (userId == null)
            return ResponseEntity.status(401).build();
        List<Long> ids = (request != null) ? request.getNotificationIds() : null;
        int count = markNotificationsReadUseCase.markAsRead(userId, ids);
        return ResponseEntity.ok(ApiResponse.success(Map.of("updatedCount", count)));
    }

    /**
     * 알림 개별 삭제
     */
    @Operation(summary = "알림 삭제", description = "특정 알림을 삭제합니다.")
    @DeleteMapping("/notifications/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @CurrentUserId Long userId,
            @PathVariable Long notificationId) {
        if (userId == null)
            return ResponseEntity.status(401).build();
        deleteNotificationUseCase.deleteNotification(userId, notificationId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
