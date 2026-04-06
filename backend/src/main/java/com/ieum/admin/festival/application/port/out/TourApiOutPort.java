package com.ieum.admin.festival.application.port.out;

import com.ieum.admin.festival.application.dto.ApiCategoryItem;

import java.util.List;

public interface TourApiOutPort {
    List<ApiCategoryItem> fetchCategoryOptions(String cat1, String cat2);
}
