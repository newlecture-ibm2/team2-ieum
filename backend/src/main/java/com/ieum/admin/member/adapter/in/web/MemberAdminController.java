package com.ieum.admin.member.adapter.in.web;

import com.ieum.admin.member.application.port.in.*;
import com.ieum.global.response.ApiResponse;
import com.ieum.global.security.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 관리자용 회원 관리 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출
 * - 인가 가드(자기 자신 차단 / 관리자 보호)는 서비스 레이어에서 처리
 */
@Tag(name = "[관리자] 회원 관리", description = "회원 목록 조회 / 상태 변경 / 역할 변경 / 강제 탈퇴")
@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class MemberAdminController {

    private final GetMemberListUseCase getMemberListUseCase;
    private final GetMemberDetailUseCase getMemberDetailUseCase;
    private final UpdateMemberStatusUseCase updateMemberStatusUseCase;
    private final DeleteMemberUseCase deleteMemberUseCase;
    private final UpdateMemberRoleUseCase updateMemberRoleUseCase;

    /* ── 회원 목록 조회 ── */
    @Operation(summary = "회원 목록 조회", description = "관리자용 회원 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<?> getMembers(
            @Parameter(description = "상태 (ACTIVE / SUSPENDED / DELETED)") @RequestParam(required = false) String status,
            @Parameter(description = "역할 (USER / ADMIN)") @RequestParam(required = false) String role,
            @Parameter(description = "가입 방식 (LOCAL / KAKAO / NAVER / GOOGLE)") @RequestParam(required = false) String provider,
            @Parameter(description = "검색 기준 (ALL / NAME / NICKNAME / EMAIL)") @RequestParam(required = false, defaultValue = "ALL") String searchType,
            @Parameter(description = "검색어") @RequestParam(required = false) String keyword,
            @Parameter(description = "페이지 번호", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 기준 (createdAt / nickname / name / loginId)") @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @Parameter(description = "정렬 방향 (asc / desc)") @RequestParam(required = false, defaultValue = "desc") String sortDirection) {
        var result = getMemberListUseCase.getMembers(page, size, status, role, provider, searchType, keyword, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /* ── 회원 상세 조회 ── */
    @Operation(summary = "회원 상세 조회", description = "회원 상세 정보를 조회합니다.")
    @GetMapping("/{userId}")
    public ResponseEntity<?> getMember(@PathVariable Long userId) {
        var member = getMemberDetailUseCase.getMember(userId);
        if (member.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "USER_001", 404, "회원을 찾을 수 없습니다.",
                            "userId=" + userId + " not found")));
        }
        return ResponseEntity.ok(ApiResponse.success(member.get()));
    }

    /* ── 회원 상태 변경 (정지/해제) ── */
    @Operation(summary = "회원 상태 변경", description = "회원 상태를 변경합니다. (ACTIVE ↔ SUSPENDED)")
    @PatchMapping("/{userId}/status")
    public ResponseEntity<?> updateStatus(
            @CurrentUserId Long requesterId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("status", "");

        if (newStatus.isBlank() || (!newStatus.equals("ACTIVE") && !newStatus.equals("SUSPENDED"))) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "VALIDATION_ERROR", 400,
                            "유효하지 않은 상태값입니다.",
                            "status must be ACTIVE or SUSPENDED, received: " + newStatus)));
        }

        try {
            updateMemberStatusUseCase.updateStatus(requesterId, userId, newStatus);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "FORBIDDEN", 403, e.getMessage(),
                            "requesterId=" + requesterId + ", targetId=" + userId)));
        }

        String message = "SUSPENDED".equals(newStatus)
                ? "회원이 7일간 정지되었습니다."
                : "회원 정지가 해제되었습니다.";
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    /* ── 관리자 강제 탈퇴 ── */
    @Operation(summary = "회원 강제 탈퇴", description = "관리자가 회원을 강제 탈퇴시킵니다.")
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteMember(
            @CurrentUserId Long requesterId,
            @PathVariable Long userId) {
        // 탈퇴 대상 존재 여부 확인
        var member = getMemberDetailUseCase.getMember(userId);
        if (member.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "USER_001", 404, "회원을 찾을 수 없습니다.",
                            "userId=" + userId + " not found")));
        }

        try {
            deleteMemberUseCase.deleteMember(requesterId, userId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "FORBIDDEN", 403, e.getMessage(),
                            "requesterId=" + requesterId + ", targetId=" + userId)));
        }

        return ResponseEntity.ok(ApiResponse.success("회원이 탈퇴 처리되었습니다."));
    }

    /* ── 역할 변경 (USER ↔ ADMIN) ── */
    @Operation(summary = "회원 역할 변경", description = "회원의 역할을 변경합니다. (USER ↔ ADMIN)")
    @PatchMapping("/{userId}/role")
    public ResponseEntity<?> updateRole(
            @CurrentUserId Long requesterId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String newRole = body.getOrDefault("role", "");

        if (newRole.isBlank() || (!newRole.equals("USER") && !newRole.equals("ADMIN"))) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "VALIDATION_ERROR", 400,
                            "유효하지 않은 역할값입니다.",
                            "role must be USER or ADMIN, received: " + newRole)));
        }

        try {
            updateMemberRoleUseCase.updateRole(requesterId, userId, newRole);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "FORBIDDEN", 403, e.getMessage(),
                            "requesterId=" + requesterId + ", targetId=" + userId)));
        }

        String message = "ADMIN".equals(newRole)
                ? "관리자 권한이 부여되었습니다."
                : "일반 회원으로 변경되었습니다.";
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
