package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.AdminFestivalRepository;
import com.ieum.admin.festival.application.result.*;
import com.ieum.admin.festival.adapter.out.persistence.entity.AdminFestivalEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FestivalAdminService {

    private final AdminFestivalRepository festivalRepository;
    private final com.ieum.admin.festival.application.service.CategoryOptionService categoryOptionService;

    public AdminFestivalListResult getFestivals(int page, int size, String keyword, String statusStr, String categoryCode, String areaCode) {
        // status를 그대로 String으로 전달 (AdminFestivalEntity.status는 String 타입)
        String status = null;
        if (statusStr != null && !statusStr.isEmpty()) {
            status = statusStr.toUpperCase();
        }

        PageRequest pageRequest = PageRequest.of(page > 0 ? page - 1 : 0, size);
        Page<AdminFestivalEntity> festivalPage = festivalRepository.searchAdminFestivals(keyword, status, categoryCode, areaCode, pageRequest);

        List<FestivalListItemResult> content = festivalPage.getContent().stream()
                .map(this::mapToItemResult)
                .collect(Collectors.toList());

        FestivalStatusCountsResult statusCounts = FestivalStatusCountsResult.builder()
                .total(festivalRepository.countPublicFestivals())
                .ongoing(festivalRepository.countPublicFestivalsByStatus("ONGOING"))
                .upcoming(festivalRepository.countPublicFestivalsByStatus("UPCOMING"))
                .ended(festivalRepository.countPublicFestivalsByStatus("ENDED"))
                .build();

        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
        String lastSyncTime = festivalRepository.findMaxApiModifiedAt()
                .map(dtf::format)
                .orElse("기록 없음");

        return AdminFestivalListResult.builder()
                .statusCounts(statusCounts)
                .lastSyncTime(lastSyncTime)
                .content(content)
                .page(festivalPage.getNumber() + 1)
                .size(festivalPage.getSize())
                .totalElements(festivalPage.getTotalElements())
                .totalPages(festivalPage.getTotalPages())
                .build();
    }

    @Transactional
    public FestivalVisibilityResult updateVisibility(Long festivalId, boolean isVisible) {
        AdminFestivalEntity festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new IllegalArgumentException("Festival not found: " + festivalId));

        festival.setIsVisible(isVisible);

        return FestivalVisibilityResult.builder()
                .status("UPDATED")
                .current(isVisible)
                .build();
    }

    private FestivalListItemResult mapToItemResult(AdminFestivalEntity f) {
        String statusStr = f.getStatus() != null ? f.getStatus().toLowerCase() : "";
        String categoryKey = f.getCategorySub() != null ? f.getCategorySub() : f.getCategory();

        return FestivalListItemResult.builder()
                .id(f.getId())
                .title(f.getTitle())
                .region(f.getLocation() != null ? f.getLocation() : f.getAddress())
                .startDate(f.getStartDate() != null ? f.getStartDate().toString() : "")
                .endDate(f.getEndDate() != null ? f.getEndDate().toString() : "")
                .category(f.getCategory())
                .categoryLabel(categoryOptionService.resolveLabel(categoryKey))
                .status(statusStr)
                .isVisible(Boolean.TRUE.equals(f.getIsVisible()))
                .build();
    }
}
