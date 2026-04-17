package com.ieum.festival.adapter.out.persistence;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import com.ieum.festival.application.port.out.FestivalPersistencePort;
import com.ieum.festival.domain.model.Festival;
import com.ieum.global.common.PagedResult;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 축제 영속성 어댑터 (Output Adapter)
 * - JPA Repository를 감싸서 Port OUT 구현
 * - Entity ↔ Domain 매핑 담당
 * - Spring Data Page → PagedResult 변환 담당
 */
@Component
@RequiredArgsConstructor
public class FestivalPersistenceAdapter implements FestivalPersistencePort {

    private final FestivalJpaRepository repository;

    // ── 목록 조회 (페이징) ──

    @Override
    public PagedResult<Festival> findAllWithDynamicOrder(String keyword, List<String> areaCodes, List<Integer> months, int page, int size) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        Page<FestivalEntity> entityPage = repository.findAllWithDynamicOrder(keyword, areaCodes, months, pageable);
        return toPagedResult(entityPage);
    }

    @Override
    public PagedResult<Festival> findOngoingFestivals(String keyword, List<String> areaCodes, List<Integer> months, int page, int size) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        Page<FestivalEntity> entityPage = repository.findOngoingFestivals(keyword, areaCodes, months, pageable);
        return toPagedResult(entityPage);
    }

    @Override
    public PagedResult<Festival> findUpcomingFestivals(String keyword, List<String> areaCodes, List<Integer> months, int page, int size) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        Page<FestivalEntity> entityPage = repository.findUpcomingFestivals(keyword, areaCodes, months, pageable);
        return toPagedResult(entityPage);
    }

    @Override
    public PagedResult<Festival> findEndedFestivals(String keyword, List<String> areaCodes, List<Integer> months, int page, int size) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        Page<FestivalEntity> entityPage = repository.findEndedFestivals(keyword, areaCodes, months, pageable);
        return toPagedResult(entityPage);
    }

    // ── 단건 조회 ──

    @Override
    public Optional<Festival> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
<<<<<<< HEAD
    public Page<FestivalEntity> findByPopularity(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findByPopularity(keyword, areaCode, month, pageable);
    }

    @Override
    public Page<FestivalEntity> findByViews(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findByViews(keyword, areaCode, month, pageable);
    }

    @Override
    public Page<FestivalEntity> findByDistance(String keyword, String areaCode, Integer month, Double lat, Double lng, Pageable pageable) {
        return repository.findByDistance(keyword, areaCode, month, lat, lng, pageable);
    }

    @Override
    public Optional<FestivalEntity> findById(Long id) {
        return repository.findById(id);
=======
    public Optional<Festival> findBySourceId(String sourceId) {
        return repository.findBySourceId(sourceId).map(this::toDomain);
    }

    // ── 전체 조회 (배치용) ──

    @Override
    public List<Festival> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    // ── 저장 ──

    @Override
    public Festival save(Festival festival) {
        FestivalEntity entity;

        if (festival.getId() != null) {
            entity = repository.findById(festival.getId())
                    .orElseGet(FestivalEntity::new);
        } else {
            entity = new FestivalEntity();
        }

        toEntity(festival, entity);
        FestivalEntity saved = repository.save(entity);
        return toDomain(saved);
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
    }

    @Override
    public void saveAll(List<Festival> festivals) {
        for (Festival festival : festivals) {
            save(festival);
        }
    }

    // ── Page → PagedResult 변환 (Adapter 내부에서만 사용) ──

    private PagedResult<Festival> toPagedResult(Page<FestivalEntity> page) {
        List<Festival> content = page.getContent().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
        return new PagedResult<>(content, page.getTotalElements(), page.getTotalPages());
    }

    // ── Entity → Domain 매핑 ──

    private Festival toDomain(FestivalEntity e) {
        return Festival.reconstitute(
                e.getId(), e.getSourceId(), e.getTitle(), e.getAddress(),
                e.getImageUrl(), e.getThumbnailUrl(), e.getOverview(), e.getDescription(),
                e.getTel(), e.getUseFee(), Festival.parseExtraImages(e.getExtraImages()),
                e.getStartDate(), e.getEndDate(), e.getStatus(), e.getSource(),
                e.getLatitude(), e.getLongitude(), e.getLocation(), e.getHomepage(),
                e.getCategory(), e.getCategoryMid(), e.getCategorySub(),
                e.getAreaCode(), e.getSigunguCode(), e.getLdongCode(),
                e.getEventPlace(), e.getPlayTime(), e.getProgram(), e.getSponsor(),
                e.getIsCustom(), e.getIsVisible(),
                e.getAvgRating(), e.getReviewCount(), e.getFavoriteCount(), e.getViewCount(),
                e.getApiModifiedAt(), e.getCreatedAt(), e.getUpdatedAt()
        );
    }

    // ── Domain → Entity 매핑 ──

    private void toEntity(Festival f, FestivalEntity e) {
        e.setSourceId(f.getSourceId());
        e.setTitle(f.getTitle());
        e.setAddress(f.getAddress());
        e.setImageUrl(f.getImageUrl());
        e.setThumbnailUrl(f.getThumbnailUrl());
        e.setOverview(f.getOverview());
        e.setDescription(f.getDescription());
        e.setTel(f.getTel());
        e.setUseFee(f.getUseFee());
        e.setExtraImages(f.getExtraImagesAsString());
        e.setStartDate(f.getStartDate());
        e.setEndDate(f.getEndDate());
        e.setStatus(f.getStatus());
        e.setSource(f.getSource());
        e.setLatitude(f.getLatitude());
        e.setLongitude(f.getLongitude());
        e.setLocation(f.getLocation());
        e.setHomepage(f.getHomepage());
        e.setCategory(f.getCategory());
        e.setCategoryMid(f.getCategoryMid());
        e.setCategorySub(f.getCategorySub());
        e.setAreaCode(f.getAreaCode());
        e.setSigunguCode(f.getSigunguCode());
        e.setLdongCode(f.getLdongCode());
        e.setEventPlace(f.getEventPlace());
        e.setPlayTime(f.getPlayTime());
        e.setProgram(f.getProgram());
        e.setSponsor(f.getSponsor());
        e.setIsCustom(f.getIsCustom());
        e.setIsVisible(f.getIsVisible());
        e.setAvgRating(f.getAvgRating());
        e.setReviewCount(f.getReviewCount());
        e.setFavoriteCount(f.getFavoriteCount());
        e.setViewCount(f.getViewCount());
    }
}
