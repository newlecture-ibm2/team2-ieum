package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.command.CustomFestivalCommand;
import com.ieum.admin.festival.application.port.in.CreateCustomFestivalUseCase;
import com.ieum.admin.festival.application.port.in.DeleteCustomFestivalUseCase;
import com.ieum.admin.festival.application.port.in.GetCustomFestivalListUseCase;
import com.ieum.admin.festival.application.port.in.UpdateCustomFestivalUseCase;
import com.ieum.admin.festival.application.port.out.AdminFestivalPort;
import com.ieum.admin.festival.application.result.CustomFestivalItem;
import com.ieum.admin.festival.application.result.CustomFestivalListResult;
import com.ieum.admin.festival.application.result.FestivalStatusCountsResult;
import com.ieum.admin.festival.domain.model.Festival;
import com.ieum.admin.festival.domain.model.FestivalSource;
import com.ieum.admin.festival.domain.model.FestivalStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자용 축제 관리 서비스 (UseCase 구현체)
 * - GetCustomFestivalListUseCase: 축제 관리 목록 조회
 * - CreateCustomFestivalUseCase: 축제 관리 생성
 * - UpdateCustomFestivalUseCase: 축제 관리 수정
 * - DeleteCustomFestivalUseCase: 축제 관리 삭제
 *
 * Port를 통해 persistence에 접근하며, Entity를 직접 사용하지 않음
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomFestivalAdminService implements GetCustomFestivalListUseCase, CreateCustomFestivalUseCase, UpdateCustomFestivalUseCase, DeleteCustomFestivalUseCase {

    private final AdminFestivalPort festivalPort;
    private final AdminFileStorageService fileStorageService;
    private final RegionOptionService regionOptionService;
    private final CategoryOptionService categoryOptionService;

    @Override
    @Transactional(readOnly = true)
    public CustomFestivalListResult getCustomFestivals(int page, int size, String keyword, String statusParam, String categoryCode, String areaCode, boolean excludeHidden) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);

        String status = null;
        if (statusParam != null && !statusParam.isEmpty()) {
            status = statusParam.toUpperCase();
        }

        List<String> targetCategories = categoryOptionService.getSelfAndDescendantCodes(categoryCode);
        Page<Festival> festivalPage;
        if (excludeHidden) {
            festivalPage = festivalPort.searchVisibleCustomFestivals(keyword, status, targetCategories, areaCode, pageable);
        } else {
            festivalPage = festivalPort.searchCustomFestivals(keyword, status, targetCategories, areaCode, pageable);
        }

        List<CustomFestivalItem> items = festivalPage.getContent().stream()
                .map(festival -> {
                    String resolvedLabel = regionOptionService.resolveLabel(festival.getAreaCode());
                    String specificCategory = festival.getCategorySub() != null && !festival.getCategorySub().isEmpty() ? festival.getCategorySub() :
                            (festival.getCategoryMid() != null && !festival.getCategoryMid().isEmpty() ? festival.getCategoryMid() : festival.getCategory());
                    String categoryLabel = categoryOptionService.resolveLabel(specificCategory);
                    return CustomFestivalItem.from(festival, resolvedLabel, specificCategory, categoryLabel);
                })
                .collect(Collectors.toList());

        FestivalStatusCountsResult statusCounts;
        if (excludeHidden) {
            statusCounts = FestivalStatusCountsResult.builder()
                    .total(festivalPort.countVisibleCustomFestivals())
                    .ongoing(festivalPort.countVisibleCustomFestivalsByStatus("ONGOING"))
                    .upcoming(festivalPort.countVisibleCustomFestivalsByStatus("UPCOMING"))
                    .ended(festivalPort.countVisibleCustomFestivalsByStatus("ENDED"))
                    .build();
        } else {
            statusCounts = FestivalStatusCountsResult.builder()
                    .total(festivalPort.countCustomFestivals())
                    .ongoing(festivalPort.countCustomFestivalsByStatus("ONGOING"))
                    .upcoming(festivalPort.countCustomFestivalsByStatus("UPCOMING"))
                    .ended(festivalPort.countCustomFestivalsByStatus("ENDED"))
                    .build();
        }

        return CustomFestivalListResult.builder()
                .totalElements(festivalPage.getTotalElements())
                .festivals(items)
                .statusCounts(statusCounts)
                .build();
    }

    @Override
    @Transactional
    public Long createCustomFestival(CustomFestivalCommand request) {
        String imgUrl = null;
        if (request.getImg() != null && !request.getImg().isEmpty()) {
            imgUrl = fileStorageService.storeFile(request.getImg());
        }

        String extraImagesStr = null;
        if (request.getExtraImgs() != null && !request.getExtraImgs().isEmpty()) {
            List<String> extraImageUrls = new ArrayList<>();
            for (MultipartFile extraImg : request.getExtraImgs()) {
                if (extraImg != null && !extraImg.isEmpty()) {
                    extraImageUrls.add(fileStorageService.storeFile(extraImg));
                }
            }
            if (!extraImageUrls.isEmpty()) {
                extraImagesStr = String.join(",", extraImageUrls);
            }
        }

        Festival festival = Festival.builder()
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
                .extraImages(extraImagesStr)
                .isCustom(true)
                .source(FestivalSource.MANUAL)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .status(Festival.calculateStatus(request.getStartDate(), request.getEndDate()))
                .build();

        Festival saved = festivalPort.save(festival);
        return saved.getId();
    }

    @Override
    @Transactional
    public void updateCustomFestival(Long festivalId, CustomFestivalCommand request) {
        Festival festival = festivalPort.findById(festivalId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        if (!festival.isCustom()) {
            throw new RuntimeException("축제 관리만 수정할 수 있습니다.");
        }

        festival.setTitle(request.getTitle());
        festival.setAreaCode(request.getAreaCode());
        festival.setStartDate(request.getStartDate());
        festival.setEndDate(request.getEndDate());
        festival.setDescription(request.getContent());
        festival.setCategory(request.getCategory());
        festival.setStatus(Festival.calculateStatus(request.getStartDate(), request.getEndDate()));

        festival.setEventPlace(request.getEventPlace());
        festival.setAddress(request.getAddress());
        festival.setUseFee(request.getUseFee());
        festival.setPlayTime(request.getPlayTime());
        festival.setTel(request.getTel());
        festival.setHomepage(request.getHomepage());
        festival.setSigunguCode(request.getSigunguCode());

        if (request.getIsVisible() != null) {
            festival.setVisible(request.getIsVisible());
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

        festivalPort.save(festival);
    }

    @Override
    @Transactional
    public void deleteCustomFestival(Long festivalId) {
        Festival festival = festivalPort.findById(festivalId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        if (!festival.isCustom()) {
            throw new RuntimeException("축제 관리만 삭제할 수 있습니다.");
        }

        festivalPort.deleteById(festivalId);
    }
}
