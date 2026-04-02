package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.in.web.request.CustomFestivalRequest;
import com.ieum.admin.festival.adapter.out.persistence.AdminFestivalRepository;
import com.ieum.admin.festival.application.result.CustomFestivalItem;
import com.ieum.admin.festival.application.result.CustomFestivalListResult;
import com.ieum.festival.domain.model.Festival;
import com.ieum.festival.domain.model.FestivalSource;
import com.ieum.festival.domain.model.FestivalStatus;
import com.ieum.global.file.FileStorageService;
import com.ieum.festival.application.service.RegionOptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomFestivalAdminService {

    private final AdminFestivalRepository repository;
    private final FileStorageService fileStorageService;
    private final RegionOptionService regionOptionService;

    @Transactional(readOnly = true)
    public CustomFestivalListResult getCustomFestivals(int page, int size, String keyword, String statusParam) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        
        FestivalStatus status = null;
        if (statusParam != null && !statusParam.isEmpty()) {
            try {
                status = FestivalStatus.valueOf(statusParam.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status mapping
            }
        }

        Page<Festival> festivalPage = repository.searchCustomFestivals(keyword, status, pageable);

        List<CustomFestivalItem> items = festivalPage.getContent().stream()
                .map(festival -> {
                    String resolvedLabel = regionOptionService.resolveLabel(festival.getAreaCode());
                    return CustomFestivalItem.from(festival, resolvedLabel);
                })
                .collect(Collectors.toList());

        com.ieum.admin.festival.application.result.FestivalStatusCountsResult statusCounts = com.ieum.admin.festival.application.result.FestivalStatusCountsResult.builder()
                .total(repository.countCustomFestivals())
                .ongoing(repository.countCustomFestivalsByStatus(FestivalStatus.ONGOING))
                .upcoming(repository.countCustomFestivalsByStatus(FestivalStatus.UPCOMING))
                .ended(repository.countCustomFestivalsByStatus(FestivalStatus.ENDED))
                .build();

        return CustomFestivalListResult.builder()
                .totalElements(festivalPage.getTotalElements())
                .festivals(items)
                .statusCounts(statusCounts)
                .build();
    }

    @Transactional
    public Long createCustomFestival(CustomFestivalRequest request) {
        String imgUrl = null;
        if (request.getImg() != null && !request.getImg().isEmpty()) {
            imgUrl = fileStorageService.storeFile(request.getImg());
        }

        Festival festival = Festival.builder()
                .title(request.getTitle())
                .areaCode(request.getAreaCode())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getContent())
                .category(request.getCategory())
                .imageUrl(imgUrl)
                .isCustom(true)
                .source(FestivalSource.MANUAL)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .status(calculateStatus(request.getStartDate(), request.getEndDate()))
                .build();

        return repository.save(festival).getId();
    }

    @Transactional
    public void updateCustomFestival(Long festivalId, CustomFestivalRequest request) {
        Festival festival = repository.findById(festivalId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        if (!festival.isCustom()) {
            throw new RuntimeException("자체 기획 축제만 수정할 수 있습니다.");
        }

        festival.setTitle(request.getTitle());
        festival.setAreaCode(request.getAreaCode());
        festival.setStartDate(request.getStartDate());
        festival.setEndDate(request.getEndDate());
        festival.setDescription(request.getContent());
        festival.setCategory(request.getCategory());
        festival.setStatus(calculateStatus(request.getStartDate(), request.getEndDate()));

        if (request.getIsVisible() != null) {
            festival.setVisible(request.getIsVisible());
        }

        if (request.getImg() != null && !request.getImg().isEmpty()) {
            String imgUrl = fileStorageService.storeFile(request.getImg());
            festival.setImageUrl(imgUrl);
        }
    }

    @Transactional
    public void deleteCustomFestival(Long festivalId) {
        Festival festival = repository.findById(festivalId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        if (!festival.isCustom()) {
            throw new RuntimeException("자체 기획 축제만 삭제할 수 있습니다.");
        }

        repository.delete(festival);
    }
    
    private FestivalStatus calculateStatus(LocalDate start, LocalDate end) {
        if (start == null || end == null) return FestivalStatus.UPCOMING;
        LocalDate now = LocalDate.now();
        if (now.isBefore(start)) {
            return FestivalStatus.UPCOMING;
        } else if (now.isAfter(end)) {
            return FestivalStatus.ENDED;
        } else {
            return FestivalStatus.ONGOING;
        }
    }
}
