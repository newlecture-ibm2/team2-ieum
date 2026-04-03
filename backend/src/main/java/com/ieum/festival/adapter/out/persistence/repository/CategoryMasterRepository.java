package com.ieum.festival.adapter.out.persistence.repository;

import com.ieum.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryMasterRepository extends JpaRepository<CategoryMasterEntity, String> {
    List<CategoryMasterEntity> findByType(String type);
    List<CategoryMasterEntity> findByIsActiveTrue();
}
