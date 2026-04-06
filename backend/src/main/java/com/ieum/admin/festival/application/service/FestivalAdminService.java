package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.port.in.GetAdminFestivalListUseCase;
import com.ieum.admin.festival.application.port.in.UpdateFestivalVisibilityUseCase;
import com.ieum.admin.festival.application.port.out.AdminFestivalPort;
import com.ieum.admin.festival.application.result.*;
import com.ieum.admin.festival.domain.model.Festival;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자용 공공 축제 서비스 (UseCase 구현체)
 * - GetAdminFestivalListUseCase: 공공 축제 목록 조회
 * - UpdateFestivalVisibilityUseCase: 노출/숨김 변경
 *
 * Port를 통해 persistence에 접근하며, Entity를 직접 사용하지 않음
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FestivalAdminService implements GetAdminFestivalListUseCase, UpdateFestivalVisibilityUseCase {

    private final AdminFestivalPort festivalPort;
    private final CategoryOptionService categoryOptionService;
    private final RegionOptionService regionOptionService;

    @Override
    public AdminFestivalListResult getFestivals(int page, int size, String keyword, String statusStr, String categoryCode, String areaCode) {
        String status = null;
        if (statusStr != null && !statusStr.isEmpty()) {
            status = statusStr.toUpperCase();
        }

        PageRequest pageRequest = PageRequest.of(page > 0 ? page - 1 : 0, size);
        List<String> targetCategories = categoryOptionService.getSelfAndDescendantCodes(categoryCode);
        Page<Festival> festivalPage = festivalPort.searchPublicFestivals(keyword, status, targetCategories, areaCode, pageRequest);

        List<FestivalListItemResult> content = festivalPage.getContent().stream()
                .map(this::mapToItemResult)
                .collect(Collectors.toList());

        FestivalStatusCountsResult statusCounts = FestivalStatusCountsResult.builder()
                .total(festivalPort.countPublicFestivals())
                .ongoing(festivalPort.countPublicFestivalsByStatus("ONGOING"))
                .upcoming(festivalPort.countPublicFestivalsByStatus("UPCOMING"))
                .ended(festivalPort.countPublicFestivalsByStatus("ENDED"))
                .build();

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
        String lastSyncTime = festivalPort.findMaxApiModifiedAt()
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

    @Override
    @Transactional
    public FestivalVisibilityResult updateVisibility(Long festivalId, boolean isVisible) {
        Festival festival = festivalPort.findById(festivalId)
                .orElseThrow(() -> new IllegalArgumentException("Festival not found: " + festivalId));

        festival.setVisible(isVisible);
        festivalPort.save(festival);

        return FestivalVisibilityResult.builder()
                .status("UPDATED")
                .current(isVisible)
                .build();
    }

    private FestivalListItemResult mapToItemResult(Festival f) {
        String statusStr = f.getStatus() != null ? f.getStatus().name().toLowerCase() : "";

        String specificCategory = f.getCategorySub() != null && !f.getCategorySub().isEmpty() ? f.getCategorySub() :
                (f.getCategoryMid() != null && !f.getCategoryMid().isEmpty() ? f.getCategoryMid() : f.getCategory());

        return FestivalListItemResult.builder()
                .id(f.getId())
                .title(f.getTitle())
                .region(regionOptionService.resolveLabel(f.getAreaCode()))
                .startDate(f.getStartDate() != null ? f.getStartDate().toString() : "")
                .endDate(f.getEndDate() != null ? f.getEndDate().toString() : "")
                .category(specificCategory)
                .categoryLabel(categoryOptionService.resolveLabel(specificCategory))
                .status(statusStr)
                .isVisible(f.isVisible())
                .build();
    }
}
