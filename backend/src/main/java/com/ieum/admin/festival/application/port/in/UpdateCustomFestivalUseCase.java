package com.ieum.admin.festival.application.port.in;

import com.ieum.admin.festival.application.command.CustomFestivalCommand;

/**
 * 축제 관리 수정 유스케이스 (API_ADM_0042)
 */
public interface UpdateCustomFestivalUseCase {

    void updateCustomFestival(Long festivalId, CustomFestivalCommand command);
}
