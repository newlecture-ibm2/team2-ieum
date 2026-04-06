package com.ieum.admin.festival.adapter.out.persistence;

import com.ieum.admin.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import com.ieum.admin.festival.adapter.out.persistence.repository.CategoryMasterRepository;
import com.ieum.admin.festival.application.port.out.CategoryMasterOutPort;
import com.ieum.admin.festival.domain.model.CategoryMaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CategoryMasterRepositoryAdapter implements CategoryMasterOutPort {

    private final CategoryMasterRepository repository;

    @Override
    public Map<String, CategoryMaster> findAllAsMap() {
        return repository.findAll().stream()
                .map(CategoryMasterEntity::toDomain)
                .collect(Collectors.toMap(CategoryMaster::getCode, e -> e));
    }

    @Override
    public void saveAll(Collection<CategoryMaster> categories) {
        List<CategoryMasterEntity> entities = categories.stream()
                .map(CategoryMasterEntity::fromDomain)
                .collect(Collectors.toList());
        repository.saveAll(entities);
    }
}
