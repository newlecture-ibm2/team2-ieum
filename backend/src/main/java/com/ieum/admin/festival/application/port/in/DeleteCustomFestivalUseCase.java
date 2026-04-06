package com.ieum.admin.festival.application.port.in;

/**
 * 축제 등록 삭제 유스케이스 (API_ADM_0043)
 */
public interface DeleteCustomFestivalUseCase {

    void deleteCustomFestival(Long festivalId);
}
