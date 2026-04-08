package com.ieum.admin.member.adapter.in.web;

import com.ieum.admin.member.application.port.in.GetMemberDetailUseCase;
import com.ieum.admin.member.application.port.in.GetMemberListUseCase;
import com.ieum.admin.member.application.port.in.UpdateMemberStatusUseCase;
import com.ieum.global.response.ApiResponse;
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
 */
@Tag(name = "[관리자] 회원 관리", description = "회원 목록 조회 / 상태 변경 (정지·해제)")
@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class MemberAdminController {

    private final GetMemberListUseCase getMemberListUseCase;
    private final UpdateMemberStatusUseCase updateMemberStatusUseCase;
    private final GetMemberDetailUseCase getMemberDetailUseCase;

    @Operation(summary = "회원 목록 조회", description = "관리자용 회원 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<?> getMembers(
            @Parameter(description = "상태 (ACTIVE / SUSPENDED / DELETED)") @RequestParam(required = false) String status,
            @Parameter(description = "역할 (USER / ADMIN)") @RequestParam(required = false) String role,
            @Parameter(description = "검색 기준 (ALL / NAME / NICKNAME / EMAIL)") @RequestParam(required = false, defaultValue = "ALL") String searchType,
            @Parameter(description = "검색어") @RequestParam(required = false) String keyword,
            @Parameter(description = "페이지 번호", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(defaultValue = "10") int size) {
        var result = getMemberListUseCase.getMembers(page, size, status, role, searchType, keyword);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

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

    @Operation(summary = "회원 상태 변경", description = "회원 상태를 변경합니다. (ACTIVE ↔ SUSPENDED)")
    @PatchMapping("/{userId}/status")
    public ResponseEntity<?> updateStatus(
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

        updateMemberStatusUseCase.updateStatus(userId, newStatus);

        String message = "SUSPENDED".equals(newStatus)
                ? "회원이 정지되었습니다."
                : "회원 정지가 해제되었습니다.";
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
