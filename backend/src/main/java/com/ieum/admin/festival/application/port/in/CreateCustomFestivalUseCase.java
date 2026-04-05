package com.ieum.admin.festival.application.port.in;

import com.ieum.admin.festival.adapter.in.web.request.CustomFestivalRequest;

/**
 * 축제 등록 생성 유스케이스 (API_ADM_0041)
 */
public interface CreateCustomFestivalUseCase {

    Long createCustomFestival(CustomFestivalRequest request);
}
