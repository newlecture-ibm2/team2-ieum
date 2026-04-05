package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.port.in.SyncFestivalStatusUseCase;
import com.ieum.admin.festival.application.port.out.AdminFestivalPort;
import com.ieum.admin.festival.application.result.DataSyncResult;
import com.ieum.admin.festival.domain.model.Festival;
import com.ieum.admin.festival.domain.model.FestivalStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FestivalStatusSyncService implements SyncFestivalStatusUseCase {

    private final AdminFestivalPort festivalPort;

    @Override
    @Transactional
    public DataSyncResult syncAllStatus() {
        log.info("Starting festival status sync...");
        int changeCount = 0;
        try {
            LocalDate now = LocalDate.now();
            // Fetch only those that might need status update. 
            // For simplicity in this admin tool, fetch all and update.
            // But we should exclude ENDED custom festivals by specs (optional).
            
            List<Festival> allFestivals = festivalPort.findAll();
            for (Festival festival : allFestivals) {
                if (festival.getStartDate() == null || festival.getEndDate() == null) continue;
                
                // Do not update ENDED custom festivals, as per requirements (often)
                if (festival.isCustom() && festival.getStatus() == FestivalStatus.ENDED) {
                    continue;
                }
                
                FestivalStatus newStatus = Festival.calculateStatus(festival.getStartDate(), festival.getEndDate());
                if (festival.getStatus() != newStatus) {
                    festival.setStatus(newStatus);
                    changeCount++;
                }
            }
            
            festivalPort.saveAll(allFestivals);
            log.info("Festival status sync completed. {} statuses updated.", changeCount);
            
            return DataSyncResult.builder()
                    .status("COMPLETED")
                    .type("STATUS")
                    .totalChanged(changeCount)
                    .details(DataSyncResult.Details.builder().status(changeCount).build())
                    .build();

        } catch (Exception e) {
            log.error("Failed to sync festival statuses", e);
            return DataSyncResult.builder().status("FAILED").type("STATUS").totalChanged(0).build();
        }
    }
}
