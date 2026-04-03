package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.in.web.request.CustomFestivalRequest;
import com.ieum.admin.festival.adapter.out.persistence.AdminFestivalRepository;
import com.ieum.admin.festival.application.result.CustomFestivalItem;
import com.ieum.admin.festival.application.result.CustomFestivalListResult;
import com.ieum.admin.festival.application.result.FestivalStatusCountsResult;
import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.global.file.FileStorageService;
import com.ieum.festival.application.service.RegionOptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomFestivalAdminService {

    private final AdminFestivalRepository repository;
    private final FileStorageService fileStorageService;
    private final RegionOptionService regionOptionService;
    private final com.ieum.festival.application.service.CategoryOptionService categoryOptionService;

    @Transactional(readOnly = true)
    public CustomFestivalListResult getCustomFestivals(int page, int size, String keyword, String statusParam, String categoryCode, String areaCode, boolean excludeHidden) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        
        // status를 String 그대로 전달 (FestivalEntity.status는 String)
        String status = null;
        if (statusParam != null && !statusParam.isEmpty()) {
            status = statusParam.toUpperCase();
        }

        Page<FestivalEntity> festivalPage;
        if (excludeHidden) {
            festivalPage = repository.searchVisibleCustomFestivals(keyword, status, categoryCode, areaCode, pageable);
        } else {
            festivalPage = repository.searchCustomFestivals(keyword, status, categoryCode, areaCode, pageable);
        }

        List<CustomFestivalItem> items = festivalPage.getContent().stream()
                .map(festival -> {
                    String resolvedLabel = regionOptionService.resolveLabel(festival.getAreaCode());
                    String categoryLabel = categoryOptionService.resolveLabel(festival.getCategory());
                    return CustomFestivalItem.from(festival, resolvedLabel, categoryLabel);
                })
                .collect(Collectors.toList());

        FestivalStatusCountsResult statusCounts;
        if (excludeHidden) {
            statusCounts = FestivalStatusCountsResult.builder()
                    .total(repository.countVisibleCustomFestivals())
                    .ongoing(repository.countVisibleCustomFestivalsByStatus("ONGOING"))
                    .upcoming(repository.countVisibleCustomFestivalsByStatus("UPCOMING"))
                    .ended(repository.countVisibleCustomFestivalsByStatus("ENDED"))
                    .build();
        } else {
            statusCounts = FestivalStatusCountsResult.builder()
                    .total(repository.countCustomFestivals())
                    .ongoing(repository.countCustomFestivalsByStatus("ONGOING"))
                    .upcoming(repository.countCustomFestivalsByStatus("UPCOMING"))
                    .ended(repository.countCustomFestivalsByStatus("ENDED"))
                    .build();
        }

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

        FestivalEntity festival = FestivalEntity.builder()
                .title(request.getTitle())
                .areaCode(request.getAreaCode())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getContent())
                .category(request.getCategory())
                .eventPlace(request.getEventPlace())
                .address(request.getAddress())
                .useFee(request.getUseFee())
                .playTime(request.getPlayTime())
                .tel(request.getTel())
                .homepage(request.getHomepage())
                .sigunguCode(request.getSigunguCode())
                .imageUrl(imgUrl)
                .thumbnailUrl(imgUrl)
                .isCustom(true)
                .source("MANUAL")
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .status(calculateStatus(request.getStartDate(), request.getEndDate()))
                .build();

        if (request.getExtraImgs() != null && !request.getExtraImgs().isEmpty()) {
            List<String> extraImageUrls = new ArrayList<>();
            for (MultipartFile extraImg : request.getExtraImgs()) {
                if (extraImg != null && !extraImg.isEmpty()) {
                    extraImageUrls.add(fileStorageService.storeFile(extraImg));
                }
            }
            if (!extraImageUrls.isEmpty()) {
                festival.setExtraImages(String.join(",", extraImageUrls));
            }
        }

        return repository.save(festival).getId();
    }

    @Transactional
    public void updateCustomFestival(Long festivalId, CustomFestivalRequest request) {
        FestivalEntity festival = repository.findById(festivalId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        if (!Boolean.TRUE.equals(festival.getIsCustom())) {
            throw new RuntimeException("축제 등록만 수정할 수 있습니다.");
        }

        festival.setTitle(request.getTitle());
        festival.setAreaCode(request.getAreaCode());
        festival.setStartDate(request.getStartDate());
        festival.setEndDate(request.getEndDate());
        festival.setDescription(request.getContent());
        festival.setCategory(request.getCategory());
        festival.setStatus(calculateStatus(request.getStartDate(), request.getEndDate()));
        
        festival.setEventPlace(request.getEventPlace());
        festival.setAddress(request.getAddress());
        festival.setUseFee(request.getUseFee());
        festival.setPlayTime(request.getPlayTime());
        festival.setTel(request.getTel());
        festival.setHomepage(request.getHomepage());
        festival.setSigunguCode(request.getSigunguCode());

        if (request.getIsVisible() != null) {
            festival.setIsVisible(request.getIsVisible());
        }

        if (request.getImg() != null && !request.getImg().isEmpty()) {
            String imgUrl = fileStorageService.storeFile(request.getImg());
            festival.setImageUrl(imgUrl);
            festival.setThumbnailUrl(imgUrl);
        }

        if (request.getExtraImgs() != null && !request.getExtraImgs().isEmpty()) {
            List<String> extraImageUrls = new ArrayList<>();
            for (MultipartFile extraImg : request.getExtraImgs()) {
                if (extraImg != null && !extraImg.isEmpty()) {
                    extraImageUrls.add(fileStorageService.storeFile(extraImg));
                }
            }
            if (!extraImageUrls.isEmpty()) {
                festival.setExtraImages(String.join(",", extraImageUrls));
            }
        }
    }

    @Transactional
    public void deleteCustomFestival(Long festivalId) {
        FestivalEntity festival = repository.findById(festivalId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        if (!Boolean.TRUE.equals(festival.getIsCustom())) {
            throw new RuntimeException("축제 등록만 삭제할 수 있습니다.");
        }

        repository.delete(festival);
    }
    
    private String calculateStatus(LocalDate start, LocalDate end) {
        if (start == null || end == null) return "UPCOMING";
        LocalDate now = LocalDate.now();
        if (now.isBefore(start)) {
            return "UPCOMING";
        } else if (now.isAfter(end)) {
            return "ENDED";
        } else {
            return "ONGOING";
        }
    }
}
