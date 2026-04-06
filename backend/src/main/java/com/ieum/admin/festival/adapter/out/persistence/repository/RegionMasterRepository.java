package com.ieum.admin.festival.adapter.out.persistence.repository;

import com.ieum.admin.festival.adapter.out.persistence.entity.RegionMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RegionMasterRepository extends JpaRepository<RegionMasterEntity, String> {
    Optional<RegionMasterEntity> findByRegionCode(String regionCode);
}
