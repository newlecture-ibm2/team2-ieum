package com.ieum.festival.user.favorite.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "즐겨찾기", description = "축제 즐겨찾기 등록 / 삭제")
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Operation(summary = "즐겨찾기 추가", description = "축제를 즐겨찾기에 추가합니다. (회원 전용)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "추가 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "409", description = "이미 즐겨찾기에 추가됨")
    })
    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Long> request) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "즐겨찾기 추가 성공"));
    }

    @Operation(summary = "즐겨찾기 삭제", description = "즐겨찾기를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "즐겨찾기를 찾을 수 없음")
    })
    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<?> removeFavorite(
            @Parameter(description = "즐겨찾기 ID", required = true, example = "1")
            @PathVariable Long favoriteId
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "즐겨찾기 삭제 성공"));
    }
}
