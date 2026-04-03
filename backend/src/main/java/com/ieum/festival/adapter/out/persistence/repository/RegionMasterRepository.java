package com.ieum.festival.adapter.out.persistence.repository;

import com.ieum.festival.adapter.out.persistence.entity.RegionMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionMasterRepository extends JpaRepository<RegionMasterEntity, String> {
    List<RegionMasterEntity> findByIsActiveTrue();
    List<RegionMasterEntity> findByType(String type);
}
