package com.ieum.admin.festival.domain.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
public class CategoryMaster {
    private String code;
    private String name;
    private String type; // STANDARD, CUSTOM
    private boolean isActive;
    @Setter private Integer level;
    @Setter private String parentCode;

    public void updateName(String name) {
        this.name = name;
    }

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
