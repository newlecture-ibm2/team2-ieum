package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.port.in.*;
import com.ieum.admin.festival.application.result.DataSyncResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FestivalSyncOrchestratorService implements OrchestrateFestivalSyncUseCase {

    private final SyncCategoryMasterUseCase syncCategoryMasterUseCase;
    private final SyncRegionMasterUseCase syncRegionMasterUseCase;
    private final SyncPublicFestivalUseCase syncPublicFestivalUseCase;
    private final SyncFestivalStatusUseCase syncFestivalStatusUseCase;

    @Override
    public DataSyncResult syncAllPublic() {
        log.info("Starting Orchestration: Public syncAll");
        var categoryRes = syncCategoryMasterUseCase.syncCategories();
        var regionRes = syncRegionMasterUseCase.syncRegions();
        var publicRes = syncPublicFestivalUseCase.syncPublicFestivals();
        var statusRes = syncFestivalStatusUseCase.syncAllStatus();

        return mergeResults("ALL", categoryRes, regionRes, publicRes, statusRes);
    }

    @Override
    public DataSyncResult syncAllCustom() {
        log.info("Starting Orchestration: Custom syncAll");
        var categoryRes = syncCategoryMasterUseCase.syncCategories();
        var regionRes = syncRegionMasterUseCase.syncRegions();
        var statusRes = syncFestivalStatusUseCase.syncAllStatus();

        return mergeResults("CUSTOM_ALL", categoryRes, regionRes, statusRes);
    }

    private DataSyncResult mergeResults(String type, DataSyncResult... results) {
        int totalCat = 0, totalReg = 0, totalSig = 0, totalFes = 0, totalSta = 0;
        int totalChanged = 0;
        boolean hasError = false;

        for (DataSyncResult r : results) {
            if ("FAILED".equals(r.getStatus())) {
                hasError = true;
            }
            if (r.getDetails() != null) {
                totalCat += r.getDetails().getCategory();
                totalReg += r.getDetails().getRegion();
                totalSig += r.getDetails().getSigungu();
                totalFes += r.getDetails().getFestival();
                totalSta += r.getDetails().getStatus();
                totalChanged += r.getTotalChanged();
            }
        }

        return DataSyncResult.builder()
                .status(hasError ? "PARTIAL_SUCCESS" : "COMPLETED")
                .type(type)
                .totalChanged(totalChanged)
                .details(DataSyncResult.Details.builder()
                        .category(totalCat)
                        .region(totalReg)
                        .sigungu(totalSig)
                        .festival(totalFes)
                        .status(totalSta)
                        .build())
                .build();
    }
}
