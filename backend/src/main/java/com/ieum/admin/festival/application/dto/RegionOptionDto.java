package com.ieum.admin.festival.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 지역 옵션 DTO (프론트엔드 규격: value, label, type)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RegionOptionDto {
    private String value;
    private String label;
    private String type;
    private boolean active;

    public RegionOptionDto(String value, String label, String type) {
        this.value = value;
        this.label = label;
        this.type = type;
        this.active = true;
    }
}
