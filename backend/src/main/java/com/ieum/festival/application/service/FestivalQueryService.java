package com.ieum.festival.application.service;

import com.ieum.festival.application.port.in.LoadFestivalDetailUseCase;
import com.ieum.festival.application.port.in.LoadFestivalListUseCase;
import com.ieum.festival.application.port.out.FestivalPersistencePort;
import com.ieum.festival.application.result.FestivalDetailResult;
import com.ieum.festival.application.result.FestivalListItemResult;
import com.ieum.festival.application.result.FestivalPageResult;
import com.ieum.festival.domain.model.Festival;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 축제 조회 서비스 (UseCase 구현체)
 * - 도메인 모델(Festival)과 Port에만 의존
 * - Entity, adapter DTO에 대한 의존성 없음
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
    public FestivalPageResult loadFestivals(String status, String keyword, String areaCode,
                                             Integer month, int page, int size) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        Page<Festival> festivalPage;

        if ("ongoing".equalsIgnoreCase(status)) {
            festivalPage = festivalPersistencePort.findOngoingFestivals(searchKeyword, areaCode, month, pageable);
        } else if ("upcoming".equalsIgnoreCase(status)) {
            festivalPage = festivalPersistencePort.findUpcomingFestivals(searchKeyword, areaCode, month, pageable);
        } else if ("ended".equalsIgnoreCase(status)) {
            festivalPage = festivalPersistencePort.findEndedFestivals(searchKeyword, areaCode, month, pageable);
        } else {
            festivalPage = festivalPersistencePort.findAllWithDynamicOrder(searchKeyword, areaCode, month, pageable);
        }

        List<FestivalListItemResult> items = festivalPage.getContent().stream()
                .map(FestivalListItemResult::from)
                .collect(Collectors.toList());

        return new FestivalPageResult(items, festivalPage.getTotalElements(), festivalPage.getTotalPages(), page);
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
}
