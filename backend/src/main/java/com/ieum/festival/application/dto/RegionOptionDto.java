package com.ieum.festival.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionOptionDto {
    private String label;
    private String value;
    private String type;
    @Builder.Default
    private boolean active = true;
}
