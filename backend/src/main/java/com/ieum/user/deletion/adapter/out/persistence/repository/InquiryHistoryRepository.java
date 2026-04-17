package com.ieum.user.deletion.adapter.out.persistence.repository;

import com.ieum.user.deletion.adapter.out.persistence.entity.InquiryHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryHistoryRepository extends JpaRepository<InquiryHistoryEntity, Long> {
}
