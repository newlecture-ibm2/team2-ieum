package com.ieum.admin.festival.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataSyncResult {
    private String status;
    private String type;
    private int totalChanged;
    
    @Builder.Default
    private Details details = new Details();

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Details {
        @Builder.Default private int category = 0;
        @Builder.Default private int region = 0;
        @Builder.Default private int sigungu = 0;
        @Builder.Default private int festival = 0;
        @Builder.Default private int status = 0;
    }
}
