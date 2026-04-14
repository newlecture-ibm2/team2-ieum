package com.ieum.admin.festival.domain.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(toBuilder = true)
public class SigunguMaster {
    private final String regionCode;
    private final String sigunguCode;
    private final String name;
    private final boolean active;
}
