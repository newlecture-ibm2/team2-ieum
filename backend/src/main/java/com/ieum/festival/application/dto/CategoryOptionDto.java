package com.ieum.festival.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryOptionDto {
    private String label;
    private String value;
    private String type; // STANDARD, CUSTOM
}
