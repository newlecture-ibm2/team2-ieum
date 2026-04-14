package com.ieum.admin.festival.domain.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(toBuilder = true)
public class RegionMaster {
    private final String regionCode;
    private final String name;
    private final String displayName;
    private final String shortName;
    private final boolean active;

    public String getEffectiveDisplayName() {
        return displayName != null && !displayName.isEmpty() ? displayName : name;
    }
}
