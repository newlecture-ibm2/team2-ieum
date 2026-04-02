package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.AdminFestivalRepository;
import com.ieum.admin.festival.application.result.*;
import com.ieum.festival.domain.model.Festival;
import com.ieum.festival.domain.model.FestivalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FestivalAdminService {

    private final AdminFestivalRepository festivalRepository;

    public AdminFestivalListResult getFestivals(int page, int size, String keyword, String statusStr) {
        FestivalStatus status = null;
        if (statusStr != null && !statusStr.isEmpty()) {
            try {
                status = FestivalStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status mapping
            }
        }

        PageRequest pageRequest = PageRequest.of(page > 0 ? page - 1 : 0, size);
        Page<Festival> festivalPage = festivalRepository.searchAdminFestivals(keyword, status, pageRequest);

        List<FestivalListItemResult> content = festivalPage.getContent().stream()
                .map(this::mapToItemResult)
                .collect(Collectors.toList());

        FestivalStatusCountsResult statusCounts = FestivalStatusCountsResult.builder()
                .total(festivalRepository.countPublicFestivals())
                .ongoing(festivalRepository.countPublicFestivalsByStatus(FestivalStatus.ONGOING))
                .upcoming(festivalRepository.countPublicFestivalsByStatus(FestivalStatus.UPCOMING))
                .ended(festivalRepository.countPublicFestivalsByStatus(FestivalStatus.ENDED))
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
        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new IllegalArgumentException("Festival not found: " + festivalId));

        festival.setVisible(isVisible);
        // Automatically handled by dirty checking in transaction

        return FestivalVisibilityResult.builder()
                .status("UPDATED")
                .current(isVisible)
                .build();
    }

    private FestivalListItemResult mapToItemResult(Festival f) {
        return FestivalListItemResult.builder()
                .id(f.getId())
                .title(f.getTitle())
                .region(f.getLocation() != null ? f.getLocation() : f.getAddress())
                .startDate(f.getStartDate() != null ? f.getStartDate().toString() : "")
                .endDate(f.getEndDate() != null ? f.getEndDate().toString() : "")
                .category(f.getCategory())
                .status(f.getStatus().name().toLowerCase())
                .isVisible(f.isVisible())
                .build();
    }
}
