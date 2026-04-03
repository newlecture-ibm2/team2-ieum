package com.ieum.festival.adapter.out.persistence.repository;

import com.ieum.festival.adapter.out.persistence.entity.SigunguMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SigunguMasterRepository extends JpaRepository<SigunguMasterEntity, Long> {
    List<SigunguMasterEntity> findByRegionCodeAndIsActiveTrue(String regionCode);
    List<SigunguMasterEntity> findByRegionCode(String regionCode);
    Optional<SigunguMasterEntity> findByRegionCodeAndSigunguCode(String regionCode, String sigunguCode);
}
