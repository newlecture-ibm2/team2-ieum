package com.ieum.festival.application.service;

import com.ieum.festival.adapter.in.web.dto.FestivalResponseDto;
import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.application.port.in.LoadFestivalDetailUseCase;
import com.ieum.festival.application.port.in.LoadFestivalListUseCase;
import com.ieum.festival.application.port.out.FestivalPersistencePort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 축제 조회 서비스 (UseCase 구현체)
 * - 목록·상세 조회 로직을 컨트롤러에서 분리
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
    public Map<String, Object> loadFestivals(String status, String keyword, String areaCode,
                                              Integer month, String sort, Double lat, Double lng,
                                              int page, int size) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        Page<FestivalEntity> festivalPage;

        if ("popular".equals(sort)) {
            festivalPage = festivalPersistencePort.findByPopularity(searchKeyword, areaCode, month, pageable);
        } else if ("views".equals(sort)) {
            festivalPage = festivalPersistencePort.findByViews(searchKeyword, areaCode, month, pageable);
        } else if ("distance".equals(sort) && lat != null && lng != null) {
            festivalPage = festivalPersistencePort.findByDistance(searchKeyword, areaCode, month, lat, lng, pageable);
        } else {
            // 기본값(latest): 기존 상태 기반 동적 정렬 유지
            if ("ongoing".equalsIgnoreCase(status)) {
                festivalPage = festivalPersistencePort.findOngoingFestivals(searchKeyword, areaCode, month, pageable);
            } else if ("upcoming".equalsIgnoreCase(status)) {
                festivalPage = festivalPersistencePort.findUpcomingFestivals(searchKeyword, areaCode, month, pageable);
            } else if ("ended".equalsIgnoreCase(status)) {
                festivalPage = festivalPersistencePort.findEndedFestivals(searchKeyword, areaCode, month, pageable);
            } else {
                festivalPage = festivalPersistencePort.findAllWithDynamicOrder(searchKeyword, areaCode, month, pageable);
            }
        }

        List<FestivalResponseDto> dtoList = festivalPage.getContent().stream()
                .map(FestivalResponseDto::new)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("list", dtoList);
        data.put("total", festivalPage.getTotalElements());
        data.put("totalPages", festivalPage.getTotalPages());
        data.put("currentPage", page);
        return data;
    }

    // ───────────────────────────────────
    //  상세 조회 (Lazy Caching 포함)
    // ───────────────────────────────────
    @Override
    @Transactional
    public Map<String, Object> loadDetail(Long festivalId) {
        Optional<FestivalEntity> optional = festivalPersistencePort.findById(festivalId);
        if (optional.isEmpty()) return null;

        FestivalEntity entity = optional.get();

        // 조회수 증가 (dirty checking으로 트랜잭션 종료 시 자동 반영)
        entity.setViewCount((entity.getViewCount() != null ? entity.getViewCount() : 0) + 1);

        // Lazy Caching: 공공 API 출처인데 overview가 아직 없으면 API 호출 후 DB 저장
        if ("API".equals(entity.getSource()) && entity.getOverview() == null) {
            Map<String, Object> extraDetails = tourApiSyncService.fetchFestivalDetail(entity.getSourceId());

            entity.setOverview((String) extraDetails.get("overview"));
            entity.setTel((String) extraDetails.get("tel"));
            entity.setUseFee((String) extraDetails.get("fee"));

            @SuppressWarnings("unchecked")
            List<String> images = (List<String>) extraDetails.get("images");
            if (images != null && !images.isEmpty()) {
                entity.setExtraImages(String.join(",", images));
            }

            festivalPersistencePort.save(entity);
        }

        FestivalResponseDto dto = new FestivalResponseDto(entity);

        Map<String, Object> result = new HashMap<>();
        result.put("id", entity.getId());
        result.put("sourceId", entity.getSourceId());
        result.put("title", entity.getTitle());
        result.put("address", entity.getAddress());
        result.put("imageUrl", entity.getImageUrl());
        result.put("thumbnailUrl", entity.getThumbnailUrl());
        result.put("startDate", entity.getStartDate());
        result.put("endDate", entity.getEndDate());
        result.put("status", dto.getStatus());
        result.put("overview", entity.getOverview());
        result.put("tel", entity.getTel());
        result.put("fee", entity.getUseFee());

        List<String> imgList = new ArrayList<>();
        if (entity.getExtraImages() != null && !entity.getExtraImages().isEmpty()) {
            imgList = Arrays.asList(entity.getExtraImages().split(","));
        }
        result.put("images", imgList);

        return result;
    }
}
