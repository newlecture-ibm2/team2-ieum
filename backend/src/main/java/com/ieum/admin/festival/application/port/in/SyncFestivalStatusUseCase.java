package com.ieum.admin.festival.application.port.in;

import com.ieum.admin.festival.application.result.DataSyncResult;

public interface SyncFestivalStatusUseCase {
    DataSyncResult syncAllStatus();
}
