package com.ieum.festival.application.service;

import com.ieum.festival.application.port.in.LoadFestivalDetailUseCase;
import com.ieum.festival.application.port.in.LoadFestivalListUseCase;
import com.ieum.festival.application.port.out.FestivalPersistencePort;
import com.ieum.festival.application.result.FestivalDetailResult;
import com.ieum.festival.application.result.FestivalListItemResult;
import com.ieum.festival.application.result.FestivalPageResult;
import com.ieum.festival.domain.model.Festival;
import com.ieum.global.common.PagedResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 축제 조회 서비스 (UseCase 구현체)
 * - 도메인 모델(Festival)과 Port에만 의존
 * - Entity, adapter DTO, Spring Data 타입에 대한 의존성 없음
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FestivalQueryService implements LoadFestivalListUseCase, LoadFestivalDetailUseCase {

    private final FestivalPersistencePort festivalPersistencePort;
    private final TourApiSyncService tourApiSyncService;

    // ───────────────────────────────────
    //  목록 조회
    // ───────────────────────────────────
    @Override
    public FestivalPageResult loadFestivals(String status, String keyword, List<String> areaCodes,
                                             List<Integer> months, String sort, Double lat, Double lng,
                                             int page, int size) {
        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        // 거리순 정렬 시: 위치 좌표 기반
        if ("distance".equalsIgnoreCase(sort) && lat != null && lng != null) {
            return loadFestivalsByDistance(status, searchKeyword, areaCodes, months, lat, lng, page, size);
        }

        // 인기순 / 조회순 / 리뷰순: 애플리케이션 레벨 정렬
        if ("popular".equalsIgnoreCase(sort) || "views".equalsIgnoreCase(sort) || "reviews".equalsIgnoreCase(sort)) {
            return loadFestivalsSortedBy(status, searchKeyword, areaCodes, months, sort, page, size);
        }

        // 기본 정렬 (최신순 = 날짜 기반 동적 정렬)
        PagedResult<Festival> result;

        if ("ongoing".equalsIgnoreCase(status)) {
            result = festivalPersistencePort.findOngoingFestivals(searchKeyword, areaCodes, months, page, size);
        } else if ("upcoming".equalsIgnoreCase(status)) {
            result = festivalPersistencePort.findUpcomingFestivals(searchKeyword, areaCodes, months, page, size);
        } else if ("ended".equalsIgnoreCase(status)) {
            result = festivalPersistencePort.findEndedFestivals(searchKeyword, areaCodes, months, page, size);
        } else {
            result = festivalPersistencePort.findAllWithDynamicOrder(searchKeyword, areaCodes, months, page, size);
        }

        List<FestivalListItemResult> items = result.getContent().stream()
                .map(FestivalListItemResult::from)
                .collect(Collectors.toList());

        return new FestivalPageResult(items, result.getTotalElements(), result.getTotalPages(), page);
    }

    /**
     * 인기순 / 조회순 / 리뷰순 정렬
     * - popular: (찜수 + 조회수 + 리뷰수×3) 종합 점수 내림차순
     * - views: 조회수 내림차순
     * - reviews: 리뷰수 내림차순 → 평균 별점 내림차순
     */
    private FestivalPageResult loadFestivalsSortedBy(String status, String keyword, List<String> areaCodes,
                                                      List<Integer> months, String sort, int page, int size) {
        PagedResult<Festival> allResult = fetchAll(status, keyword, areaCodes, months);

        Comparator<FestivalListItemResult> comparator;
        switch (sort.toLowerCase()) {
            case "views":
                comparator = Comparator.comparingInt((FestivalListItemResult f) -> safe(f.getViewCount())).reversed();
                break;
            case "reviews":
                comparator = Comparator.comparingInt((FestivalListItemResult f) -> safe(f.getReviewCount())).reversed()
                        .thenComparing(Comparator.comparingDouble((FestivalListItemResult f) -> safeDouble(f.getAvgRating())).reversed());
                break;
            case "popular":
            default:
                // 인기점수 = 찜수 + 조회수 + (리뷰수 × 3) — 리뷰는 적극적 참여이므로 가중치 부여
                comparator = Comparator.comparingInt((FestivalListItemResult f) ->
                        safe(f.getFavoriteCount()) + safe(f.getViewCount()) + safe(f.getReviewCount()) * 3
                ).reversed();
                break;
        }

        List<FestivalListItemResult> sorted = allResult.getContent().stream()
                .map(FestivalListItemResult::from)
                .sorted(comparator)
                .collect(Collectors.toList());

        return paginate(sorted, page, size);
    }

    /**
     * 거리순 정렬 — Haversine 공식으로 사용자 위치와 축제 좌표 간 거리를 계산하여 가까운 순 정렬
     */
    private FestivalPageResult loadFestivalsByDistance(String status, String keyword, List<String> areaCodes,
                                                       List<Integer> months, double userLat, double userLng,
                                                       int page, int size) {
        PagedResult<Festival> allResult = fetchAll(status, keyword, areaCodes, months);

        List<FestivalListItemResult> sorted = allResult.getContent().stream()
                .map(FestivalListItemResult::from)
                .sorted((a, b) -> {
                    double distA = calculateDistance(userLat, userLng, a.getLatitude(), a.getLongitude());
                    double distB = calculateDistance(userLat, userLng, b.getLatitude(), b.getLongitude());
                    return Double.compare(distA, distB);
                })
                .collect(Collectors.toList());

        return paginate(sorted, page, size);
    }

    /**
     * Haversine 공식 — 두 지점 간 거리(km) 계산
     */
    private double calculateDistance(double lat1, double lng1, Double lat2, Double lng2) {
        if (lat2 == null || lng2 == null) return Double.MAX_VALUE; // 좌표 없는 축제는 가장 먼 곳으로

        final double R = 6371; // 지구 반경 (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ───────────────────────────────────
    //  상세 조회 (Lazy Caching 포함)
    // ───────────────────────────────────
    @Override
    @Transactional
    public FestivalDetailResult loadDetail(Long festivalId) {
        Optional<Festival> optional = festivalPersistencePort.findById(festivalId);
        if (optional.isEmpty()) return null;

        Festival festival = optional.get();

        // Lazy Caching: 공공 API 출처인데 overview가 아직 없으면 API 호출 후 DB 저장
        if (festival.needsApiDetailEnrichment()) {
            Map<String, Object> extraDetails = tourApiSyncService.fetchFestivalDetail(festival.getSourceId());

            @SuppressWarnings("unchecked")
            List<String> images = (List<String>) extraDetails.get("images");

            festival.enrichWithApiDetail(
                    (String) extraDetails.get("overview"),
                    (String) extraDetails.get("tel"),
                    (String) extraDetails.get("fee"),
                    images
            );

            festivalPersistencePort.save(festival);
        }

        return FestivalDetailResult.from(festival);
    }

    // ───────────────────────────────────
    //  공통 헬퍼 메서드
    // ───────────────────────────────────

    /** status 필터에 따라 전체 데이터 조회 (애플리케이션 레벨 정렬용) */
    private PagedResult<Festival> fetchAll(String status, String keyword, List<String> areaCodes, List<Integer> months) {
        int maxSize = 10000;
        if ("ongoing".equalsIgnoreCase(status)) {
            return festivalPersistencePort.findOngoingFestivals(keyword, areaCodes, months, 1, maxSize);
        } else if ("upcoming".equalsIgnoreCase(status)) {
            return festivalPersistencePort.findUpcomingFestivals(keyword, areaCodes, months, 1, maxSize);
        } else if ("ended".equalsIgnoreCase(status)) {
            return festivalPersistencePort.findEndedFestivals(keyword, areaCodes, months, 1, maxSize);
        } else {
            return festivalPersistencePort.findAllWithDynamicOrder(keyword, areaCodes, months, 1, maxSize);
        }
    }

    /** 리스트를 수동 페이징 */
    private FestivalPageResult paginate(List<FestivalListItemResult> list, int page, int size) {
        long total = list.size();
        int totalPages = (int) Math.ceil((double) total / size);
        int fromIndex = Math.min((page - 1) * size, list.size());
        int toIndex = Math.min(fromIndex + size, list.size());
        return new FestivalPageResult(list.subList(fromIndex, toIndex), total, totalPages, page);
    }

    /** null-safe Integer → int */
    private int safe(Integer value) {
        return value != null ? value : 0;
    }

    /** null-safe Double → double */
    private double safeDouble(Double value) {
        return value != null ? value : 0.0;
    }
}
