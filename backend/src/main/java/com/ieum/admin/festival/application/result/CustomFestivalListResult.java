package com.ieum.admin.festival.application.result;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class CustomFestivalListResult {
    private long totalElements;
    private List<CustomFestivalItem> festivals;
}
