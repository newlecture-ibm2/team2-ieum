package com.ieum.admin.festival.adapter.out.persistence.repository;

import com.ieum.admin.festival.adapter.out.persistence.entity.SigunguMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import com.ieum.admin.festival.adapter.out.persistence.entity.SigunguMasterId;

public interface SigunguMasterRepository extends JpaRepository<SigunguMasterEntity, SigunguMasterId> {
    List<SigunguMasterEntity> findByRegionCode(String regionCode);

    @Query("SELECT s.name FROM SigunguMasterEntity s WHERE s.regionCode = :regionCode AND s.sigunguCode = :sigunguCode")
    String findNameByRegionCodeAndSigunguCode(@Param("regionCode") String regionCode, @Param("sigunguCode") String sigunguCode);
}
