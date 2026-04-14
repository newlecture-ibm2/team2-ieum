package com.ieum.admin.festival.adapter.out.persistence.repository;

import com.ieum.admin.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoryMasterRepository extends JpaRepository<CategoryMasterEntity, String> {
    Optional<CategoryMasterEntity> findByCode(String code);
}
