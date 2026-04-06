package com.ieum.admin.festival.application.port.out;

import com.ieum.admin.festival.domain.model.CategoryMaster;

import java.util.Collection;
import java.util.Map;

public interface CategoryMasterOutPort {
    Map<String, CategoryMaster> findAllAsMap();
    void saveAll(Collection<CategoryMaster> categories);
}
