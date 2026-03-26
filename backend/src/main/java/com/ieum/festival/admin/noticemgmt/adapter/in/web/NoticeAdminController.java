package com.ieum.festival.admin.noticemgmt.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "[관리자] 공지사항 관리", description = "공지사항 작성 / 수정 / 삭제")
@RestController
@RequestMapping("/api/admin/notices")
public class NoticeAdminController {

    @Operation(summary = "공지사항 작성", description = "관리자가 새 공지사항을 작성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "작성 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    @PostMapping
    public ResponseEntity<?> createNotice(@RequestBody Map<String, String> request) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "공지사항 작성 성공"));
    }

    @Operation(summary = "공지사항 수정", description = "기존 공지사항을 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    @PutMapping("/{noticeId}")
    public ResponseEntity<?> updateNotice(
            @Parameter(description = "공지사항 ID", required = true, example = "1")
            @PathVariable Long noticeId,
            @RequestBody Map<String, String> request
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "공지사항 수정 성공"));
    }

    @Operation(summary = "공지사항 삭제", description = "공지사항을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<?> deleteNotice(
            @Parameter(description = "공지사항 ID", required = true, example = "1")
            @PathVariable Long noticeId
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "공지사항 삭제 성공"));
    }
}
