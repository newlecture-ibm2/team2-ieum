package com.ieum.festival.adapter.in.web;

import com.ieum.festival.application.port.in.LoadFestivalDetailUseCase;
import com.ieum.festival.application.port.in.LoadFestivalListUseCase;
import com.ieum.festival.application.port.in.RefreshFestivalStatusUseCase;
import com.ieum.festival.application.port.in.SyncFestivalUseCase;
import com.ieum.festival.application.result.FestivalDetailResult;
import com.ieum.festival.application.result.FestivalPageResult;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 축제 컨트롤러 (Input Adapter)
 * - UseCase 인터페이스에만 의존 (구체 서비스 참조 없음)
 * - 응답 형식을 프로젝트 공통 ApiResponse로 통일
 */
@Tag(name = "축제", description = "축제 조회 / 검색 / 공공데이터 동기화")
@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalController {

    private final LoadFestivalListUseCase loadFestivalListUseCase;
    private final LoadFestivalDetailUseCase loadFestivalDetailUseCase;
    private final SyncFestivalUseCase syncFestivalUseCase;
    private final RefreshFestivalStatusUseCase refreshFestivalStatusUseCase;

    /**
     * 축제 상태 일괄 갱신 (개발용)
     */
    @Operation(summary = "축제 상태 일괄 갱신 (개발용)", description = "모든 축제의 status를 오늘 날짜 기준으로 DB에 일괄 업데이트합니다.")
    @PatchMapping("/refresh-status")
    public ApiResponse<Map<String, Object>> refreshStatus() {
        int updated = refreshFestivalStatusUseCase.refreshAllStatuses();
        return ApiResponse.success(Map.of(
                "message", "축제 상태 일괄 갱신 완료",
                "updatedCount", updated
        ));
    }

    /**
     * 축제 목록 조회 (날짜 기반 동적 필터링)
     */
    @Operation(summary = "축제 목록 조회 (날짜 기반 동적 필터링)", description = "status 파라미터에 따라 전체/진행중/진행예정/종료 축제를 날짜 기반으로 필터링하여 조회합니다.\n"
            +
            "- 전체(all/미지정): 진행중 → 진행예정(가까운 순) → 종료(최근 순)\n" +
            "- 진행중(ongoing): 오늘 날짜 기준 startDate ≤ 오늘 ≤ endDate\n" +
            "- 진행예정(upcoming): startDate > 오늘, 시작일 가까운 순\n" +
            "- 종료(ended): endDate < 오늘, 최근 종료순\n" +
            "- sort=distance 시 lat, lng 파라미터 필수 (사용자 위치 기반 거리순 정렬)\n" +
            "- areaCode, month는 콤마(,) 구분으로 다중 선택 가능 (예: areaCode=1,6,31)")
    @GetMapping
    public ApiResponse<FestivalPageResult> getFestivals(
            @Parameter(description = "필터 상태 (all, ongoing, upcoming, ended)", example = "ongoing") @RequestParam(required = false) String status,
            @Parameter(description = "검색 키워드 (축제명, 지역명)", example = "벚꽃") @RequestParam(required = false) String keyword,
            @Parameter(description = "지역 코드 (콤마 구분 다중 선택 가능, 1=서울, 31=경기 등)", example = "1,6") @RequestParam(required = false) String areaCode,
            @Parameter(description = "월별 필터 (콤마 구분 다중 선택 가능, 1~12)", example = "4,5") @RequestParam(required = false) String month,
            @Parameter(description = "정렬 기준 (latest, popular, views, reviews, distance)", example = "distance") @RequestParam(required = false) String sort,
            @Parameter(description = "사용자 위도 (거리순 정렬 시 필수)", example = "37.5665") @RequestParam(required = false) Double lat,
            @Parameter(description = "사용자 경도 (거리순 정렬 시 필수)", example = "126.978") @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {

        // 콤마 구분 문자열 → List 변환 (다중 선택 지원)
        List<String> areaCodes = parseStringList(areaCode);
        List<Integer> months = parseIntList(month);

        FestivalPageResult data = loadFestivalListUseCase.loadFestivals(status, keyword, areaCodes, months, sort, lat, lng, page, size);
        return ApiResponse.success(data);
    }

    /** 콤마 구분 문자열 → List<String> (null/빈값이면 null 반환 → 쿼리에서 전체 조회) */
    private List<String> parseStringList(String csv) {
        if (csv == null || csv.isBlank()) return null;
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /** 콤마 구분 문자열 → List<Integer> (null/빈값이면 null 반환) */
    private List<Integer> parseIntList(String csv) {
        if (csv == null || csv.isBlank()) return null;
        try {
            return Arrays.stream(csv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 공공데이터 동기화 (수동 배치)
     */
    @Operation(summary = "공공데이터 동기화 (수동 배치)", description = "한국관광공사 TourAPI를 호출하여 DB를 업데이트합니다. 기본값: 오늘 기준 2년 전")
    @PostMapping("/sync")
    public ApiResponse<String> syncTourApi(
            @Parameter(description = "시작일 (YYYYMMDD, 미입력 시 2년 전)", example = "20240401") @RequestParam(required = false) String eventStartDate) {
        if (eventStartDate == null || eventStartDate.isBlank()) {
            eventStartDate = java.time.LocalDate.now().minusYears(2)
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        }
        syncFestivalUseCase.syncFestivals(eventStartDate);
        return ApiResponse.success("동기화 스케줄이 완료되었습니다. (로그를 확인하세요)");
    }

    /**
     * 축제 상세 조회
     */
    @Operation(
            summary = "축제 상세 조회",
            description = "축제 ID로 상세 정보를 조회합니다. (최초 1회 한국관광공사 TourAPI 연동 후 DB 자동 캐싱)\n\n" +
                          "**[공공데이터 연동 상세 항목 (TourAPI)]**\n" +
                          "- `overview` (개요): 축제에 대한 상세 설명 및 텍스트 묘사\n" +
                          "- `tel` (전화번호): 행사 문의 및 안내 전화번호\n" +
                          "- `useFee` / `fee` (이용요금): 티켓 가격 및 이용 요금 정보\n" +
                          "- `extraImages` (추가 사진): 축제 전경 및 포스터 등 세부 투어 이미지 배열\n" +
                          "- `homepage`, `sponsor`, `playTime` 등 부가 정보"
    )
    @GetMapping("/{festivalId}")
    public ResponseEntity<ApiResponse<?>> getFestivalDetail(@PathVariable Long festivalId) {
        FestivalDetailResult detail = loadFestivalDetailUseCase.loadDetail(festivalId);
        if (detail == null) {
            return ResponseEntity.status(404).body(
                    ApiResponse.error(ApiResponse.ErrorResponse.of("FEST_001", 404, "축제 데이터를 찾을 수 없습니다.", "Festival not found for id=" + festivalId))
            );
        }
        return ResponseEntity.ok(ApiResponse.success(detail));
    }
}
