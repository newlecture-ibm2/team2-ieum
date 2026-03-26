package com.ieum.festival.admin.festivalmgmt.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "[관리자] 축제 관리", description = "공공데이터 API 축제 동기화")
@RestController
@RequestMapping("/api/admin/festivals")
public class FestivalAdminController {

    @Operation(summary = "축제 데이터 동기화", description = "공공데이터포털 API에서 최신 축제 데이터를 가져와 DB에 동기화합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "동기화 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요"),
            @ApiResponse(responseCode = "500", description = "외부 API 호출 실패")
    })
    @PostMapping("/sync")
    public ResponseEntity<?> syncFestivals() {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "축제 데이터 동기화 성공"));
    }
}
