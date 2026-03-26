package com.ieum.festival.user.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "사용자", description = "내 정보 조회 / FCM 토큰 등록")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 프로필 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo() {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "내 정보"));
    }

    @Operation(summary = "내 즐겨찾기 목록", description = "내가 즐겨찾기한 축제 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/me/favorites")
    public ResponseEntity<?> getMyFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "내 즐겨찾기"));
    }

    @Operation(summary = "내 게시글 목록", description = "내가 작성한 게시글 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/me/posts")
    public ResponseEntity<?> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "내 게시글"));
    }

    @Operation(summary = "내 리뷰 목록", description = "내가 작성한 리뷰 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/me/reviews")
    public ResponseEntity<?> getMyReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "내 리뷰"));
    }

    @Operation(summary = "내 알림 목록", description = "내 알림 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/me/notifications")
    public ResponseEntity<?> getMyNotifications() {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "내 알림"));
    }

    @Operation(summary = "FCM 토큰 등록", description = "푸시 알림용 FCM 토큰을 등록합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @PostMapping("/me/fcm-token")
    public ResponseEntity<?> registerFcmToken(@RequestBody Map<String, String> request) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "FCM 토큰 등록 성공"));
    }
}
