package com.ieum.user.deletion.adapter.out.persistence.repository;

import com.ieum.user.deletion.adapter.out.persistence.entity.ReportHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportHistoryRepository extends JpaRepository<ReportHistoryEntity, Long> {
}
