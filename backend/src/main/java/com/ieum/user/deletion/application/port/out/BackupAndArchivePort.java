package com.ieum.user.deletion.application.port.out;

public interface BackupAndArchivePort {
    void archiveAndRemoveInquiries(Long userId);
    void archiveAndRemoveReports(Long userId);
}
