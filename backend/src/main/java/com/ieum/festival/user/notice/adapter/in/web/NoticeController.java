package com.ieum.festival.user.notice.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "공지사항", description = "공지사항 조회 (CRUD는 Admin API)")
@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Operation(summary = "공지사항 목록 조회", description = "공지사항 목록을 페이지네이션으로 조회합니다. 비회원 이용 가능.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping
    public ResponseEntity<?> getNotices(
            @Parameter(description = "페이지 번호", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "공지사항 목록"));
    }

    @Operation(summary = "공지사항 상세 조회", description = "공지사항 ID로 상세 내용을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    @GetMapping("/{noticeId}")
    public ResponseEntity<?> getNoticeDetail(
            @Parameter(description = "공지사항 ID", required = true, example = "1")
            @PathVariable Long noticeId
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "공지사항 상세"));
    }
}
