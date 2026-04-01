package com.ieum.festival.adapter.out.persistence.repository;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FestivalJpaRepository extends JpaRepository<FestivalEntity, Long> {
    Optional<FestivalEntity> findBySourceId(String sourceId);
}
