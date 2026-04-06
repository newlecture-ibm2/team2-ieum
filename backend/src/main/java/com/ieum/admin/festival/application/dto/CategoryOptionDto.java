package com.ieum.admin.festival.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 카테고리 옵션 DTO (프론트엔드 규격: value, label, type)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryOptionDto {
    private String value;
    private String label;
    private String type;
}
