package com.ieum.festival.adapter.out.persistence;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import com.ieum.festival.application.port.out.FestivalPersistencePort;
import com.ieum.festival.domain.model.Festival;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 축제 영속성 어댑터 (Output Adapter)
 * - JPA Repository를 감싸서 Port OUT 구현
 * - Entity ↔ Domain 매핑 담당
 */
@Component
@RequiredArgsConstructor
public class FestivalPersistenceAdapter implements FestivalPersistencePort {

    private final FestivalJpaRepository repository;

    @Override
    public Page<Festival> findAllWithDynamicOrder(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findAllWithDynamicOrder(keyword, areaCode, month, pageable)
                .map(this::toDomain);
    }

    @Override
    public Page<Festival> findOngoingFestivals(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findOngoingFestivals(keyword, areaCode, month, pageable)
                .map(this::toDomain);
    }

    @Override
    public Page<Festival> findUpcomingFestivals(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findUpcomingFestivals(keyword, areaCode, month, pageable)
                .map(this::toDomain);
    }

    @Override
    public Page<Festival> findEndedFestivals(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findEndedFestivals(keyword, areaCode, month, pageable)
                .map(this::toDomain);
    }

    @Override
    public Optional<Festival> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Festival save(Festival festival) {
        FestivalEntity entity;

        if (festival.getId() != null) {
            entity = repository.findById(festival.getId())
                    .orElseGet(() -> new FestivalEntity());
        } else {
            entity = new FestivalEntity();
        }

        // Domain → Entity 매핑
        toEntity(festival, entity);

        FestivalEntity saved = repository.save(entity);
        return toDomain(saved);
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
